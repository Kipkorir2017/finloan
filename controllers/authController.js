const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.login = async(req,res)=>{

  const {email,password} = req.body

  try{

    const user = await User.findOne({email})

    if(!user)
      return res.status(400).json({message:"User not found"})

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch)
      return res.status(400).json({message:"Invalid password"})

    const token = jwt.sign(
      {id:user._id, role:user.role},
      JWT_SECRET=SuperSecretKey123,
      {expiresIn:"1d"}
    )

    res.json({
      token,
      user:{
        id:user._id,
        name:user.name,
        role:user.role
      }
    })

  }catch(err){
    res.status(500).json(err)
  }
}