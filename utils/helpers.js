import bcrypt from 'bcrypt';
import { reject } from 'bcrypt/promises.js';

export const hashed = async (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) reject(err);
                resolve(hash);
            })
        })
    })

};
export const comparePassword = (password, hash) => {
    return bcrypt.compare(password, hash);
}