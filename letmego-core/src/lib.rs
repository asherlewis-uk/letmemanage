pub mod crypto;
pub mod error;
pub mod config;   // <--- Add this
pub mod network;  // <--- Add this

pub use crypto::{KeyPair, TetherKey};
pub use error::{CoreError, Result};
pub use config::ConfigManager;     // <--- Add this
// We don't export WireGuardManager globally yet, that's fine.