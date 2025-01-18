document.addEventListener("DOMContentLoaded", function () {
    const encryptionAlgorithmDropdown = document.getElementById("encryptionAlgorithmDropdown");
    const keyLengthDropdown = document.getElementById("keyLengthDropdown");
    const paddingSchemeDropdown = document.getElementById("paddingSchemeDropdown");
    const hashingAlgorithmDropdown = document.getElementById("hashingAlgorithmDropdown");
    const blockCipherModeDropdown = document.getElementById("blockCipherModeDropdown");
    const initializationVectorDropdown = document.getElementById("initializationVectorDropdown");

    const cryptoData = {
        aes: {
            keyLengths: [128, 192, 256],
            paddingSchemes: ["PKCS#7", "No Padding"],
            hashingAlgorithms: ["SHA-256", "SHA-384", "SHA-512"],
            blockCipherModes: ["ECB", "CBC", "GCM", "CTR", "CFB", "OFB"],
            initializationVector: ["Required for CBC, GCM, and other modes except ECB"]
        },
        des: {
            keyLengths: [56],
            paddingSchemes: ["PKCS#7", "No Padding"],
            hashingAlgorithms: ["SHA-1", "MD5"],
            blockCipherModes: ["ECB", "CBC", "CFB", "OFB"],
            initializationVector: ["Required for CBC, CFB, and OFB"]
        },
        des3: {
            keyLengths: [112, 168],
            paddingSchemes: ["PKCS#7", "No Padding"],
            hashingAlgorithms: ["SHA-1", "MD5"],
            blockCipherModes: ["ECB", "CBC", "CFB", "OFB"],
            initializationVector: ["Required for CBC, CFB, and OFB"]
        },
        rsa: {
            keyLengths: [1024, 2048, 3072, 4096],
            paddingSchemes: ["PKCS#1 v1.5", "OAEP", "PSS", "No Padding"],
            hashingAlgorithms: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"],
            blockCipherModes: ["N/A"], // RSA is not a block cipher
            initializationVector: ["Not Applicable"]
        },
        chacha20: {
            keyLengths: [256],
            paddingSchemes: ["No Padding"], // Stream ciphers don’t use padding
            hashingAlgorithms: ["SHA-256", "SHA-512"],
            blockCipherModes: ["N/A"], // Stream cipher, no block cipher modes
            initializationVector: ["Required (Nonce)"]
        }
    };

    // Populate dependent dropdowns based on selected algorithm
    encryptionAlgorithmDropdown.addEventListener("change", function () {
        const selectedAlgorithm = encryptionAlgorithmDropdown.value;

        if (cryptoData[selectedAlgorithm]) {
            populateDropdown(keyLengthDropdown, cryptoData[selectedAlgorithm].keyLengths);
            populateDropdown(paddingSchemeDropdown, cryptoData[selectedAlgorithm].paddingSchemes);
            populateDropdown(hashingAlgorithmDropdown, cryptoData[selectedAlgorithm].hashingAlgorithms);
            populateDropdown(blockCipherModeDropdown, cryptoData[selectedAlgorithm].blockCipherModes);
            populateDropdown(initializationVectorDropdown, cryptoData[selectedAlgorithm].initializationVector);

            keyLengthDropdown.disabled = false;
            paddingSchemeDropdown.disabled = false;
            hashingAlgorithmDropdown.disabled = false;
            blockCipherModeDropdown.disabled = false;
            initializationVectorDropdown.disabled = false;
        } else {
            clearDropdown(keyLengthDropdown);
            clearDropdown(paddingSchemeDropdown);
            clearDropdown(hashingAlgorithmDropdown);
            clearDropdown(blockCipherModeDropdown);
            clearDropdown(initializationVectorDropdown);

            keyLengthDropdown.disabled = true;
            paddingSchemeDropdown.disabled = true;
            hashingAlgorithmDropdown.disabled = true;
            blockCipherModeDropdown.disabled = true;
            initializationVectorDropdown.disabled = true;
        }
    });

    // Populate a dropdown with options
    function populateDropdown(dropdown, options) {
        clearDropdown(dropdown);
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
    }

    // Clear a dropdown
    function clearDropdown(dropdown) {
        dropdown.innerHTML = "<option value=''>Select an option</option>";
    }

    // Validate the configuration and display vulnerabilities
    function validateCryptographicConfiguration(config) {
        const vulnerabilities = [];
        const relevantAttacks = [];
        const recommendations = [];
    
        let securityScore = 100;

        // Validate Algorithm
        if (config.algorithm === "des") {
            vulnerabilities.push(
                "DES is insecure due to its short key length of 56 bits. Modern attacks, such as brute force, can decrypt DES-encrypted data within hours or less."
            );
            relevantAttacks.push(
                "- Brute-force attack: Exhaustively tries all possible keys.",
                "- Cryptanalysis: Exploits weaknesses in DES's S-box design."
            );
            recommendations.push(
                "Replace DES with AES (preferably AES-256) for better security."
            );
            securityScore -= 50
        } else if (config.algorithm === "3des") {
            vulnerabilities.push(
                "3DES is deprecated and considered insecure for modern applications."
            );
            relevantAttacks.push(
                "- Meet-in-the-middle attack: Reduces the effective key size.",
                "- Brute-force attack: Exploits the shorter effective key size."
            );
            recommendations.push(
                "Replace 3DES with AES (preferably AES-256)."
            );
            securityScore -= 30;
        }
    
        // Validate Key Length
        if (config.algorithm === "rsa" && config.keyLength < 2048) {
            vulnerabilities.push(
                `RSA key length of ${config.keyLength} bits is insufficient for security.`
            );
            relevantAttacks.push(
                "- Factorization attacks: Methods like GNFS can break RSA with insufficient key lengths."
            );
            recommendations.push(
                "Use RSA keys with a minimum length of 2048 bits. Consider switching to Elliptic Curve Cryptography (ECC) for better performance and equivalent security."
            );
            securityScore -= 20;
        } else if (config.algorithm === "aes" && config.keyLength < 128) {
            vulnerabilities.push(
                `AES key length of ${config.keyLength} bits is insecure.`
            );
            relevantAttacks.push(
                "- Brute-force attack: Computationally infeasible for AES-128 or higher but possible for shorter keys."
            );
            recommendations.push(
                "Use AES keys with a minimum length of 128 bits. AES-256 is recommended for stronger security."
            );
            securityScore -= 20;
        }
    
        // Validate Padding Scheme
        if (config.algorithm === "rsa" && config.padding === "pkcs1") {
            vulnerabilities.push(
                "PKCS#1 v1.5 padding is vulnerable to padding oracle attacks."
            );
            relevantAttacks.push(
                "- Padding oracle attack: Exploits weaknesses in PKCS#1 padding."
            );
            recommendations.push(
                "Use OAEP (Optimal Asymmetric Encryption Padding) instead of PKCS#1 padding for RSA."
            );
            securityScore -= 15;
        }
        if (config.algorithm === "aes" && config.padding === "none" && config.blockCipherMode !== "ctr") {
            vulnerabilities.push(
                "No Padding should only be used with stream cipher modes like CTR."
            );
            relevantAttacks.push(
                "- Length-extension attack: Exploits the absence of padding."
            );
            recommendations.push(
                "Ensure AES is used with proper padding or use CTR mode, which does not require padding."
            );
            securityScore -= 15;
        }
    
        // Validate Block Cipher Modes
        if (config.blockCipherMode === "ecb") {
            vulnerabilities.push(
                "ECB mode is insecure because it leaks patterns in the plaintext."
            );
            relevantAttacks.push(
                "- Block-replay attack: Reuse of identical ciphertext blocks.",
                "- Pattern analysis: Exposes structural information about plaintext."
            );
            recommendations.push(
                "Replace ECB mode with CBC, GCM, or CTR. GCM is recommended for its support of authenticated encryption."
            );
            securityScore -= 25;
        }
    
        // Validate Hashing Algorithm
        if (config.hashAlgorithm === "md5") {
            vulnerabilities.push(
                "MD5 is deprecated due to collision vulnerabilities."
            );
            relevantAttacks.push(
                "- Collision attack: Two inputs produce the same hash."
            );
            recommendations.push(
                "Use SHA-256 or higher (e.g., SHA-384 or SHA-512). For password hashing, use bcrypt, scrypt, or Argon2."
            );
            securityScore -= 20;
        } else if (config.hashAlgorithm === "sha-1") {
            vulnerabilities.push(
                "SHA-1 is vulnerable to collision attacks."
            );
            relevantAttacks.push(
                "- Collision attack: Reduced computational cost makes forging possible."
            );
            recommendations.push(
                "Replace SHA-1 with SHA-256 or higher."
            );
            securityScore -= 15;
        }
    
        // Validate Initialization Vector (IV)
        if (["cbc", "gcm", "cfb", "ofb"].includes(config.blockCipherMode.toLowerCase())) {
            if (!config.initializationVector || config.initializationVector.length < 16) {
                vulnerabilities.push(
                    "IV is required for CBC, GCM, and similar modes. It must be random, unique, and sufficiently long (at least 16 bytes)."
                );
                relevantAttacks.push(
                    "- Predictable IV attack: Allows attackers to infer plaintext or repeat patterns."
                );
                recommendations.push(
                    "Use a secure random number generator to create IVs that are random, unique, and at least 16 bytes long."
                );
            }
            securityScore -= 20;
        }
    

        let securityLevel = "Industry Standard";
        let securityColor = "green";
        if (securityScore < 60) {
            securityLevel = "Critical!!";
            securityColor = "red";
        } else if (securityScore < 80) {
            securityLevel = "Medium";
            securityColor = "orange";
        }

        // Combine output
        const output = [];
        if (vulnerabilities.length > 0) {
            output.push("Detected Vulnerabilities:");
            output.push(...vulnerabilities);
            output.push("Relevant Attacks:");
            output.push(...relevantAttacks);
        } else {
            output.push("Configuration is secure. No known vulnerabilities detected.");
        }

        const recommendationsDiv = document.getElementById("recommendationsContent");
        if (recommendationsDiv) {
            recommendationsDiv.innerHTML = recommendations.length > 0
                ? `<h3></h3><ul>${recommendations.map(r => `<li>${r}</li>`).join("")}</ul>`
                : `<h3>No recommendations. Configurations are completely SECURE!!</h3>`;
        }

        const securityLevelDiv = document.getElementById("securityLevel");
        if (securityLevelDiv) {
            securityLevelDiv.innerHTML = `<strong>Security Level:</strong> <span style="color:${securityColor};">${securityLevel}</span>`;
        }
    
        return output;
    }
    
    // Form submission handler
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        const config = {
            algorithm: encryptionAlgorithmDropdown.value.toLowerCase(),
            keyLength: parseInt(keyLengthDropdown.value) || 0,
            padding: paddingSchemeDropdown.value.toLowerCase(),
            hashAlgorithm: hashingAlgorithmDropdown.value.toLowerCase(),
            blockCipherMode: blockCipherModeDropdown.value.toLowerCase(),
            initializationVector: initializationVectorDropdown.value
        };

        const vulnerabilities = validateCryptographicConfiguration(config);
        const outputDiv = document.getElementById("vulnerabilityOutput");
        outputDiv.innerHTML = vulnerabilities.map(v => `<p>${v}</p>`).join("");
    });

    const recommendationsButton = document.getElementById("recommendationsButton");
    recommendationsButton.addEventListener("click", function () {
        const recommendationsDiv = document.getElementById("recommendationsOutput");
        recommendationsDiv.style.display = recommendationsDiv.style.display === "none" ? "block" : "none";
    });
});
