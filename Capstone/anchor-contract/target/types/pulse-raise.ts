/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pulse_raise.json`.
 */
export type PulseRaise = {
  "address": "5StMYy1mzsxmVRK7VwKBK13HPEh33exVupCp6ihWhe5g",
  "metadata": {
    "name": "pulseRaise",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "campaignCreation",
      "discriminator": [
        126,
        122,
        66,
        144,
        129,
        1,
        100,
        180
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "program_config.campaign_count",
                "account": "programConfig"
              }
            ]
          }
        },
        {
          "name": "programConfig",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "jitosolMint"
        },
        {
          "name": "campaignJitosolAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "jitosolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "desc",
          "type": "string"
        },
        {
          "name": "imgUri",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        }
      ]
    },
    {
      "name": "campaignDeletion",
      "discriminator": [
        155,
        251,
        102,
        143,
        164,
        117,
        103,
        68
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        }
      ]
    },
    {
      "name": "campaignUpdation",
      "discriminator": [
        136,
        66,
        66,
        47,
        8,
        72,
        167,
        245
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "desc",
          "type": "string"
        },
        {
          "name": "imgUri",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        }
      ]
    },
    {
      "name": "donate",
      "discriminator": [
        121,
        186,
        218,
        211,
        73,
        70,
        196,
        180
      ],
      "accounts": [
        {
          "name": "donor",
          "writable": true,
          "signer": true
        },
        {
          "name": "txn",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "donor"
              },
              {
                "kind": "arg",
                "path": "cid"
              },
              {
                "kind": "account",
                "path": "campaign.donations",
                "account": "campaign"
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "jitoStakePoolProgram"
        },
        {
          "name": "stakePool",
          "writable": true
        },
        {
          "name": "reserveStake",
          "writable": true
        },
        {
          "name": "managerFeeAccount",
          "writable": true
        },
        {
          "name": "stakePoolWithdrawAuthority"
        },
        {
          "name": "jitosolMint",
          "docs": [
            "JitoSOL mint"
          ],
          "writable": true
        },
        {
          "name": "campaignJitosolAta",
          "docs": [
            "Campaign's JitoSOL ATA (must match campaign.jitosol_ata)"
          ],
          "writable": true
        },
        {
          "name": "deployer",
          "writable": true
        },
        {
          "name": "deployerJitosolAta",
          "docs": [
            "Deployer JitoSOL ATA (for the Stake Pool referral requirement)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "deployer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "jitosolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "config"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "amountSol",
          "type": "u64"
        }
      ]
    },
    {
      "name": "feeUpdation",
      "discriminator": [
        243,
        163,
        127,
        76,
        56,
        135,
        69,
        222
      ],
      "accounts": [
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialise",
      "discriminator": [
        162,
        198,
        118,
        235,
        215,
        247,
        25,
        118
      ],
      "accounts": [
        {
          "name": "programConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "deployer",
          "writable": true
        },
        {
          "name": "config"
        },
        {
          "name": "withdrawer",
          "writable": true,
          "signer": true
        },
        {
          "name": "txn",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "withdrawer"
              },
              {
                "kind": "arg",
                "path": "cid"
              },
              {
                "kind": "account",
                "path": "campaign.withdrawals",
                "account": "campaign"
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "campaignJitosolAta",
          "docs": [
            "Campaign JitoSOL ATA (source)"
          ],
          "writable": true
        },
        {
          "name": "jitosolMint",
          "docs": [
            "JitoSOL mint"
          ]
        },
        {
          "name": "withdrawerJitosolAta",
          "docs": [
            "Withdrawer JitoSOL ATA (destination)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "withdrawer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "jitosolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "deployerJitosolAta",
          "docs": [
            "Deployer JitoSOL ATA for fee"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "deployer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "jitosolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "amountJito",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "donationRecord",
      "discriminator": [
        219,
        64,
        180,
        111,
        72,
        70,
        71,
        0
      ]
    },
    {
      "name": "programConfig",
      "discriminator": [
        196,
        210,
        90,
        231,
        144,
        149,
        140,
        63
      ]
    },
    {
      "name": "withdrawalRecord",
      "discriminator": [
        88,
        59,
        154,
        202,
        216,
        210,
        211,
        237
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "configuredAlready",
      "msg": "Program Configured Already"
    },
    {
      "code": 6001,
      "name": "titleTooLong",
      "msg": "Title exceeds the maximum length of 64 characters."
    },
    {
      "code": 6002,
      "name": "descriptionTooLong",
      "msg": "Description exceeds the maximum length of 512 characters."
    },
    {
      "code": 6003,
      "name": "imageUrlTooLong",
      "msg": "Image URL exceeds the maximum length of 256 characters."
    },
    {
      "code": 6004,
      "name": "invalidGoalAmount",
      "msg": "Invalid goal amount. Goal must be greater than 1 SOL"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized access."
    },
    {
      "code": 6006,
      "name": "notFound",
      "msg": "Campaign Not Found"
    },
    {
      "code": 6007,
      "name": "inactiveCampaign",
      "msg": "Campaign Inactive Already"
    },
    {
      "code": 6008,
      "name": "campaignGoalAccomplished",
      "msg": "Campaign Goal Accomplished"
    },
    {
      "code": 6009,
      "name": "invalidWithdrawalAmount",
      "msg": "Withdrawal Amount must be greater than 1 SOL"
    },
    {
      "code": 6010,
      "name": "insufficientFund",
      "msg": "Insufficient Fund in the campaign"
    },
    {
      "code": 6011,
      "name": "invalidDeployerAddress",
      "msg": "Invalid Deployer Address"
    },
    {
      "code": 6012,
      "name": "invalidPlatformFee",
      "msg": "Platform Fee must be within 1% to 15%"
    },
    {
      "code": 6013,
      "name": "mathOverflow",
      "msg": "Input beyond limits"
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "desc",
            "type": "string"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "amtRaised",
            "type": "u64"
          },
          {
            "name": "donations",
            "type": "u64"
          },
          {
            "name": "withdrawals",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "jitosolAta",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "donationRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "donor",
            "type": "pubkey"
          },
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "amountSol",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "programConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialised",
            "type": "bool"
          },
          {
            "name": "campaignCount",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "deployer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "withdrawalRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "withdrawer",
            "type": "pubkey"
          },
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "amountJito",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
