const crypto = require('crypto');

// Shared secret key (store securely in production)
const SECRET_KEY = crypto.randomBytes(32); // 256-bit key
const IV_LENGTH = 16; // AES IV length (128 bits)

// Function to encrypt a message
function encryptMessage(message) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedMessage: encrypted,
    };
}



// Function to decrypt a message
function decryptMessage(iv, encryptedMessage) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


// Function to hash a message
function generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}


const encrypt = (req, res)=>{
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: 'Message is required.' });
    }

    const encryptedData = encryptMessage(message);
    const hash = generateHash(encryptedData.encryptedMessage);

    res.send({
        ...encryptedData,
        hash,
    });
}

const decrypt = (req, res)=>{
    const { iv, encryptedMessage, hash } = req.body;

    if (!iv || !encryptedMessage || !hash) {
        return res.status(400).send({ error: 'IV, encryptedMessage, and hash are required.' });
    }

    // Verify integrity
    const recalculatedHash = generateHash(encryptedMessage);
    if (hash !== recalculatedHash) {
        return res.status(400).send({ error: 'Message integrity compromised!' });
    }

    // Decrypt message
    const decryptedMessage = decryptMessage(iv, encryptedMessage);
    res.send({ decryptedMessage });
}


module.exports = {
    encrypt,
    decrypt,
}
