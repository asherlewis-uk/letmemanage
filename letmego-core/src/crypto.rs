use ed25519_dalek::SigningKey;
use rand::rngs::OsRng;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use base64ct::{Base64, Encoding};
use std::fmt; // <--- Added this import

/// Cryptographic keypair for device identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPair {
    pub(crate) private_key: Vec<u8>, 
    pub(crate) public_key: Vec<u8>,
}

impl KeyPair {
    /// Generate a new random keypair
    pub fn generate() -> Self {
        let mut csprng = OsRng;
        let mut key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut key_bytes);
        
        let signing_key = SigningKey::from_bytes(&key_bytes);
        let verifying_key = signing_key.verifying_key();

        Self {
            private_key: signing_key.to_bytes().to_vec(),
            public_key: verifying_key.to_bytes().to_vec(),
        }
    }

    /// Get the Public Key as a Base64 string
    pub fn public_key_base64(&self) -> String {
        Base64::encode_string(&self.public_key)
    }
}

/// 6-digit Tether Key (100000-999999)
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct TetherKey(u32);

impl TetherKey {
    pub fn generate() -> Self {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        Self(rng.gen_range(100_000..1_000_000))
    }

    // We keep this for backward compatibility
    pub fn as_string(&self) -> String {
        format!("{:06}", self.0)
    }
}

// This allows .to_string() to work automatically
impl fmt::Display for TetherKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:06}", self.0)
    }
}