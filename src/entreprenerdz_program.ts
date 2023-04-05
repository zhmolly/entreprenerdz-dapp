export type EntreprenerdzProgram = {
  "version": "0.1.3",
  "name": "entreprenerdz_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entreprenerdzCollection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlTokenCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stakeFee",
          "type": "u64"
        },
        {
          "name": "stakePeriod",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateSetting",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entreprenerdzCollection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlTokenCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stakeFee",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "stakePeriod",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "createStake",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addStake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "freezeWl",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wlMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unfreezeWl",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wlMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "entreprenerdzCollection",
            "type": "publicKey"
          },
          {
            "name": "wlTokenCreator",
            "type": "publicKey"
          },
          {
            "name": "vaultAccount",
            "type": "publicKey"
          },
          {
            "name": "stakeFee",
            "type": "u64"
          },
          {
            "name": "stakePeriod",
            "type": "u64"
          },
          {
            "name": "totalOrders",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "stakeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idx",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "entreprenerdzMints",
            "type": {
              "array": [
                "publicKey",
                8
              ]
            }
          },
          {
            "name": "wlMint",
            "type": "publicKey"
          },
          {
            "name": "totalStaked",
            "type": "u8"
          },
          {
            "name": "isFrozen",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "stakedAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAccount",
      "msg": "Invalid account"
    },
    {
      "code": 6001,
      "name": "InvalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6002,
      "name": "InvalidCollection",
      "msg": "Invalid collection"
    },
    {
      "code": 6003,
      "name": "Uninitialized",
      "msg": "Account not initialized"
    },
    {
      "code": 6004,
      "name": "InvalidPubkey",
      "msg": "Invalid Pubkey"
    },
    {
      "code": 6005,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6006,
      "name": "NftNotStaked",
      "msg": "You need to stake nfts before freeze WL"
    },
    {
      "code": 6007,
      "name": "NftNotUnstaked",
      "msg": "You need to unstake nfts before unfreeze WL"
    },
    {
      "code": 6008,
      "name": "NftNotFrozen",
      "msg": "Nft not frozen"
    },
    {
      "code": 6009,
      "name": "NftAlreadyStaked",
      "msg": "Nft already all staked"
    },
    {
      "code": 6010,
      "name": "NftAlreadyClaimed",
      "msg": "Nft already claimed"
    },
    {
      "code": 6011,
      "name": "WlAlreadyFrozen",
      "msg": "WL token already frozen"
    },
    {
      "code": 6012,
      "name": "InvalidUnstakeTime",
      "msg": "Invalid unstake time"
    },
    {
      "code": 6013,
      "name": "NumericalOverflow",
      "msg": "NumericalOverflow"
    }
  ]
};

export const IDL: EntreprenerdzProgram = {
  "version": "0.1.3",
  "name": "entreprenerdz_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entreprenerdzCollection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlTokenCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stakeFee",
          "type": "u64"
        },
        {
          "name": "stakePeriod",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateSetting",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entreprenerdzCollection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlTokenCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stakeFee",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "stakePeriod",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "createStake",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addStake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "freezeWl",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wlMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unfreezeWl",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wlMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wlToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderIdx",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "entreprenerdzCollection",
            "type": "publicKey"
          },
          {
            "name": "wlTokenCreator",
            "type": "publicKey"
          },
          {
            "name": "vaultAccount",
            "type": "publicKey"
          },
          {
            "name": "stakeFee",
            "type": "u64"
          },
          {
            "name": "stakePeriod",
            "type": "u64"
          },
          {
            "name": "totalOrders",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "stakeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idx",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "entreprenerdzMints",
            "type": {
              "array": [
                "publicKey",
                8
              ]
            }
          },
          {
            "name": "wlMint",
            "type": "publicKey"
          },
          {
            "name": "totalStaked",
            "type": "u8"
          },
          {
            "name": "isFrozen",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "stakedAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAccount",
      "msg": "Invalid account"
    },
    {
      "code": 6001,
      "name": "InvalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6002,
      "name": "InvalidCollection",
      "msg": "Invalid collection"
    },
    {
      "code": 6003,
      "name": "Uninitialized",
      "msg": "Account not initialized"
    },
    {
      "code": 6004,
      "name": "InvalidPubkey",
      "msg": "Invalid Pubkey"
    },
    {
      "code": 6005,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6006,
      "name": "NftNotStaked",
      "msg": "You need to stake nfts before freeze WL"
    },
    {
      "code": 6007,
      "name": "NftNotUnstaked",
      "msg": "You need to unstake nfts before unfreeze WL"
    },
    {
      "code": 6008,
      "name": "NftNotFrozen",
      "msg": "Nft not frozen"
    },
    {
      "code": 6009,
      "name": "NftAlreadyStaked",
      "msg": "Nft already all staked"
    },
    {
      "code": 6010,
      "name": "NftAlreadyClaimed",
      "msg": "Nft already claimed"
    },
    {
      "code": 6011,
      "name": "WlAlreadyFrozen",
      "msg": "WL token already frozen"
    },
    {
      "code": 6012,
      "name": "InvalidUnstakeTime",
      "msg": "Invalid unstake time"
    },
    {
      "code": 6013,
      "name": "NumericalOverflow",
      "msg": "NumericalOverflow"
    }
  ]
};
