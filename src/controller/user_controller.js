import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asynhandler.js"
import  jwt from "jsonwebtoken"
import {User} from "../models/usermodel.js"
const generateAccessandRefreshtoken=async(userId)=>{
try {
    const user=await User.findById(userId)
    const accesstoken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshtoken;
    await user.save({validateBeforeSave:false})
    return {accessToken, refreshToken};
} catch (error) {
    throw new ApiError(500, "something wrong while gention acces and refresh tokens");
}
}

// now register 
const registerUser=asyncHandler(async(req, res)=>{
    const {fullname , username , email, password}=req.body
    if([fullname, username , email, password].some((field)=>field?.trim()==="")) {
        throw new ApiError(400,"all fields are required")// agr 
    // in charo mai se kisis mai bhi ek cheez empty hai yani vo pge name field ko lega trim krke check
    // krega ki emoty ya null hai agr ek mai bhi hua to return true and error dega  
}
const existedUser=await User.findOne({
    $or:[{username}, {email}]
})
if(existeduser){
    throw new ApiError(409, "user with email or username already exists");
}
// abhi tak hmne bs cheeze liye hai store kri hai ab hm user create krnege 
const user=await User.create({
    fullname,
    email,
    password,
    username:username.toLowerCase()
  })
  const createUser=await User.findById(user._id).select(
    "-password -refreshToken"  )  // ACHA mai yha pe user mang rhi hu autr bolri hu ki passowrd and 
    // refreshtoken mt bhjna kyuki maine yhi user object ko aage rersponse mai bhjna hau frontend mai
// regrshtoken abhi database mai nhi aaya hai mtlb field aagyi h schema se but no value like 
// refehstoken=" " // empty hoga iskivalue login ke time aagyegi vha upr avla fucntion chlega 

if(!createUser){
    throw new ApiError(500, "there is something wrong while registering user")
}
return res.status(200).json(
    new ApiResponse(200,createUser,"user registed succesfully") // ye user ko return hoga yani frontend mai 
)

});
// login user;

const loginUser=asyncHandler(async(req, res)=>{
    const {email, username, password}=req.body
    // iska mtlb hai mai req.body mai se values leri hu jo user ne bhji hai its like
    // const email=req.body.email or const password=req.body. passowrd
    if(!(username||email)){
        throw new ApiError(400, "email or username is missing")
    }
// ab manle mughe mil gyi jo user ne bhja hai ab mai check krungi ki kya vpo usewr datrabse m hai
const user=await User.findOne({
    $or:[{username},{email}]
})
if(!user){
    throw new ApiError(404, "user dont exist");
}
const isPasswordValid=await user.isPasswordCorrect(password)
if(!isPasswordValid){
    throw new ApiError(401,"inavlid user credentials")
}
const {accessToken , refreshToken}=await generateAccessandRefreshtoken(user._id);

const loggedInUser=await User.findById(user._id).select("-password, -refreshToken")
// mai har ksis cheez krne ke bnaad databs se user mangugi kyuki mugeh forntend ko resoknse bhjna hai
const options={
    httpOnly:true,
    secure:true
}
return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken, option).json(
    new ApiResponse(
        200, {
            user:loggedInUser, accessToken,refreshToken
        },
        "user logged in succesfully"
    )
)
// ye cookie ka syntax hai name , value , options
})

 // logout user 
const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(            // yha hmne dtabse se hataya h phele 
    req.user._id,
    {
        $set:{ 
            refreshToken:undefined
        }
    },
    {
        new:true
    }
)
const options={
    httpOnly:true,
    secure:true
}
return res.status(200).clearCookie("accessToken", options)   // ye  databse se to ht gya ab hm apne side se bhi
  //hatare hai browser se 
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "user logged out "))
})


/// yha vo hoga jb acces token expire hojaye and rrfesh token use genrate kre but after verfing the user
const refreshAccessToken=asyncHandler(async(req, res)=>{
const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized access")
}
try {
    const decodedToken=jwt.verify(
       incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET 
    )
// AB mughe decoded tpken mil gya hai to ab mughe us token se uyser mil jayega 
// and mai ab is token mai se user lungi aur 
const user=User.findById(decodedToken?.id)
if(!user){
    throw new ApiError(401, "invalid efersh token")
}
if(incomingRefreshToken!==user?.refreshToken){
    throw new ApiError(401, "refersh token is expired")
}
const option={
    httpOnly:true,
    secure:true
} 
// yha poe refsreh vala bhi hm nyaa bnare hai kyuki ab vo vala purana to verufy mai us eho gya a
// to islei ab naya bnake use frinetdn ko bhjre hai
const { accessToken, newRefreshToken}=await generateAccessandRefreshtoken(user._id)
return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken,options).json(
    new ApiResponse(
        200,{accessToken,refreshToken:newRefreshToken}, "access token refsrh successfully"
    )
)
} catch (error) {
    throw new ApiError(401, error?.message||"inavclid refsrh token") // 
    // agr error hai to uski message proeprty do nhi hai to inavlid refsh tpoken do
}
})



// change password

const changeCurrentPassword=asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword}=req.body ;
    const user=await User.findById(req.user?.id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "inavlid old password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false});

    return res.status(200).json(new ApiError(
        200,{},"password chnaged succesfully"
    ))
})





 const getCurrentUser=asyncHandler(async(req, res)=>{
    return res.status(200).json(new ApiError(
        200,req.user, "current user fectd succefully"
    ))
 })

 

 const updateAccountDetails=asyncHandler(async(req, res)=>{
    const {fullname, email}=req.body
    if(!fullname||!email){
        throw new ApiError(400, "all fields are required")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new:true}
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user,"account detaisl updated succefully"))
 })




 export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser, updateAccountDetails}


