const jwt = require('jsonwebtoken');

module.exports= {

    AccessToken : (user_id) => {
        const payload = {
            user: { id: user_id}
        }
        return jwt.sign(
            payload,
    
            process.env.SECRET_KEY
            ,
            {
                expiresIn: '1d',
            }
    
    
        );
    
    },
    RefreashToken : (user_id) => {
        const payload = {
            user: { id: user_id }
        }
        return jwt.sign(
            payload,
    
            process.env.SECRET_KEY
            ,
            {
                expiresIn: '1d',
            }
    
    
        );
    
    }

}