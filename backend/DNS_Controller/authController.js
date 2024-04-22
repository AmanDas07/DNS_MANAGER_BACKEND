import jwt from "jsonwebtoken";
import { comparePassword, hashed } from "../utils/helpers.js";
import userModel from "../models/userModel.js"
import express from "express";
import { requireSignin } from "../middlewares/page.js"

const authController = express.Router();

authController.post("/Register", async (request, response) => {

    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;

    if (!name) {
        return response.status(400).send('Name is required');
    }
    if (!password) {
        return response.status(400).send('Password is required');
    }
    if (!email) {
        return response.status(400).send('Email is required');

    }




    const isValidEmail = (email) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    };

    if (!isValidEmail(email)) {
        return response.status(400).send('Invalid Email');

    }

    if (password.length < 8) {
        return response.status(400).send("Password too short");
    }




    try {

        const save = async () => {
            const exist = await userModel.findOne({ email: email }).exec();
            if (exist) {
                return response.status(400).send('Email already exists');

            }
            else {

                const hashedPassword = await hashed(password);
                const user = new userModel({ name, email, password: hashedPassword });
                await user.save().then(() => { return response.status(200).send('User Registered') });
            }

        }
        save();

    } catch (error) {
        console.log(error);
    }


}
)
authController.post("/Login", async (request, response) => {

    const email = request.body.email;
    const password = request.body.password;

    try {

        const verify = async () => {
            const user = await userModel.findOne({ email: email });

            if (!user) { return response.status(400).send("Invalid User") };
            const match = await comparePassword(password, user.password);
            if (!match) { return response.status(400).send("Invalid Password") };

            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });
            user.password = undefined;
            user.answer = undefined;
            response.status(200).json({
                token,
                user,
            });
        }

        verify();
    }
    catch (error) {
        console.log(error);
        return res.status(400).send("Error, Try Again");
    }




})

authController.get("/currentuser", requireSignin, async (req, res) => {

    try {

        const find = async () => {

            const user = await userModel.findById(req.auth._id)
            return res.status(200).json({ ok: true });
        }
        find();
    }
    catch (error) {
        return res.status(400).json(error);
    }
}
)
authController.post("/forgotPassword", async (request, response) => {

    const email = request.body.email;
    const newPassword = request.body.newPassword;



    try {
        const reset = async () => {
            const exist = await userModel.findOne({ email: email }).exec();
            const hashednewPassword = await hashed(newPassword);
            const user = await userModel.findByIdAndUpdate(exist._id, { password: hashednewPassword });
            return response.status(201).send("Password Reset success");




        }
        reset();

    } catch (error) {
        console.log(error);
        return res.status(400).send("Somthing Went Wrong");
    }

})

export default authController;