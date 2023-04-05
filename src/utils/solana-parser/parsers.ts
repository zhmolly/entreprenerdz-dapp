import { Buffer } from "buffer";

import {
	PublicKey,
	TransactionInstruction,
	SystemInstruction,
	SystemProgram,
	Connection,
	Message,
	Transaction,
	AccountMeta,
	ParsedMessage,
	PartiallyDecodedInstruction,
} from "@solana/web3.js";

import * as spl from "@solana/spl-token";
import { BN, BorshInstructionCoder, Idl, SystemProgram as SystemProgramIdl } from "@project-serum/anchor";
import { blob, struct, u8 } from "@solana/buffer-layout";

import {
	AssociatedTokenProgramIdlLike,
	IdlAccount,
	IdlAccountItem,
	IdlAccounts,
	InstructionNames,
	InstructionParserInfo,
	InstructionParsers,
	ParsedIdlArgs,
	ParsedIdlInstruction,
	ParsedInstruction,
	ParserFunction,
	ProgramInfoType,
	UnknownInstruction,
} from "./interfaces";
import { compiledInstructionToInstruction, flattenTransactionResponse, parsedInstructionToInstruction, parseTransactionAccounts } from "./helpers";

function decodeSystemInstruction(instruction: TransactionInstruction): ParsedInstruction<SystemProgramIdl> {
	const ixType = SystemInstruction.decodeInstructionType(instruction);
	let parsed: ParsedIdlInstruction<SystemProgramIdl> | null;
	switch (ixType) {
		case "AdvanceNonceAccount": {
			const decoded = SystemInstruction.decodeNonceAdvance(instruction);
			parsed = {
				name: "advanceNonceAccount",
				accounts: [
					{ name: "nonce", pubkey: decoded.noncePubkey, isSigner: false, isWritable: true },
					{ name: "recentBlockhashSysvar", ...instruction.keys[1] },
					{ name: "nonceAuthority", pubkey: decoded.authorizedPubkey, isSigner: true, isWritable: false },
				],
				args: {},
			} as ParsedIdlInstruction<SystemProgramIdl, "advanceNonceAccount">;
			break;
		}
		case "Allocate": {
			const decoded = SystemInstruction.decodeAllocate(instruction);
			parsed = {
				name: "allocate",
				accounts: [{ name: "newAccount", pubkey: decoded.accountPubkey, isSigner: true, isWritable: true }],
				args: { space: new BN(decoded.space) },
			} as ParsedIdlInstruction<SystemProgramIdl, "allocate">;
			break;
		}
		case "AllocateWithSeed": {
			const decoded = SystemInstruction.decodeAllocateWithSeed(instruction);
			parsed = {
				name: "allocateWithSeed",
				accounts: [
					{ name: "newAccount", pubkey: decoded.accountPubkey, isSigner: false, isWritable: true },
					{ name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
				],
				args: {
					seed: decoded.seed,
					space: new BN(decoded.space),
					owner: decoded.programId,
					base: decoded.basePubkey,
				},
			} as ParsedIdlInstruction<SystemProgramIdl, "allocateWithSeed">;
			break;
		}
		case "Assign": {
			const decoded = SystemInstruction.decodeAssign(instruction);
			parsed = {
				name: "assign",
				accounts: [{ name: "assignedAccount", pubkey: decoded.accountPubkey, isSigner: true, isWritable: true }],
				args: { owner: decoded.programId },
			} as ParsedIdlInstruction<SystemProgramIdl, "assign">;
			break;
		}
		case "AssignWithSeed": {
			const decoded = SystemInstruction.decodeAssignWithSeed(instruction);
			parsed = {
				name: "assignWithSeed",
				accounts: [
					{ name: "assigned", pubkey: decoded.accountPubkey, isSigner: false, isWritable: true },
					{ name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
				],
				args: {
					seed: decoded.seed, // string
					owner: decoded.programId,
					base: decoded.basePubkey,
				},
			} as ParsedIdlInstruction<SystemProgramIdl, "assignWithSeed">;
			break;
		}
		case "AuthorizeNonceAccount": {
			const decoded = SystemInstruction.decodeNonceAuthorize(instruction);
			parsed = {
				name: "authorizeNonceAccount",
				accounts: [
					{ name: "nonce", isSigner: false, isWritable: true, pubkey: decoded.noncePubkey },
					{ name: "nonceAuthority", isSigner: true, isWritable: false, pubkey: decoded.authorizedPubkey },
				],
				args: { authorized: decoded.newAuthorizedPubkey },
			} as ParsedIdlInstruction<SystemProgramIdl, "authorizeNonceAccount">;
			break;
		}
		case "Create": {
			const decoded = SystemInstruction.decodeCreateAccount(instruction);
			parsed = {
				name: "createAccount",
				accounts: [
					{ name: "payer", pubkey: decoded.fromPubkey, isSigner: true, isWritable: true },
					{ name: "newAccount", pubkey: decoded.newAccountPubkey, isSigner: true, isWritable: true },
				],
				args: { lamports: new BN(decoded.lamports), owner: decoded.programId, space: new BN(decoded.space) },
			} as ParsedIdlInstruction<SystemProgramIdl, "createAccount">;
			break;
		}
		case "CreateWithSeed": {
			const decoded = SystemInstruction.decodeCreateWithSeed(instruction);
			parsed = {
				name: "createAccountWithSeed",
				accounts: [
					{ name: "payer", pubkey: decoded.fromPubkey, isSigner: true, isWritable: true },
					{ name: "created", pubkey: decoded.newAccountPubkey, isSigner: false, isWritable: true },
					{ name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
				],
				args: {
					lamports: new BN(decoded.lamports),
					owner: decoded.programId,
					space: new BN(decoded.space),
					seed: decoded.seed,
					base: decoded.basePubkey,
				},
			} as ParsedIdlInstruction<SystemProgramIdl, "createAccountWithSeed">;
			break;
		}
		case "InitializeNonceAccount": {
			const decoded = SystemInstruction.decodeNonceInitialize(instruction);
			parsed = {
				name: "initializeNonceAccount",
				accounts: [
					{ name: "nonce", pubkey: decoded.noncePubkey, isSigner: false, isWritable: true },
					{ name: "recentBlockhashSysvar", ...instruction.keys[1] },
					{ name: "rentSysvar", ...instruction.keys[2] },
				],
				args: { authorized: decoded.authorizedPubkey },
			} as ParsedIdlInstruction<SystemProgramIdl, "initializeNonceAccount">;
			break;
		}
		case "Transfer": {
			const decoded = SystemInstruction.decodeTransfer(instruction);
			parsed = {
				name: "transfer",
				accounts: [
					{ name: "sender", pubkey: decoded.fromPubkey, isSigner: true, isWritable: true },
					{ name: "receiver", pubkey: decoded.toPubkey, isWritable: true, isSigner: false },
				],
				args: { lamports: new BN(decoded.lamports.toString()) },
			} as ParsedIdlInstruction<SystemProgramIdl, "transfer">;
			break;
		}
		case "TransferWithSeed": {
			const decoded = SystemInstruction.decodeTransferWithSeed(instruction);
			parsed = {
				name: "transferWithSeed",
				accounts: [
					{ name: "sender", pubkey: decoded.fromPubkey, isSigner: false, isWritable: true },
					{ name: "base", pubkey: decoded.basePubkey, isSigner: true, isWritable: false },
					{ name: "receiver", pubkey: decoded.toPubkey, isSigner: false, isWritable: true },
				],
				args: { owner: decoded.programId, lamports: new BN(decoded.lamports.toString()), seed: decoded.seed },
			} as ParsedIdlInstruction<SystemProgramIdl, "transferWithSeed">;
			break;
		}
		case "WithdrawNonceAccount": {
			const decoded = SystemInstruction.decodeNonceWithdraw(instruction);
			parsed = {
				name: "withdrawNonceAccount",
				accounts: [
					{ name: "nonce", pubkey: decoded.noncePubkey, isSigner: false, isWritable: true },
					{ name: "recepient", pubkey: decoded.toPubkey, isSigner: false, isWritable: true },
					{ name: "recentBlockhashSysvar", ...instruction.keys[2] },
					{ name: "rentSysvar", ...instruction.keys[3] },
					{ name: "nonceAuthority", pubkey: decoded.noncePubkey, isSigner: true, isWritable: false },
				],
				args: { lamports: new BN(decoded.lamports) },
			} as ParsedIdlInstruction<SystemProgramIdl, "withdrawNonceAccount">;
			break;
		}
		default: {
			parsed = null;
		}
	}

	return parsed
		? {
			...parsed,
			programId: SystemProgram.programId,
		}
		: {
			programId: SystemProgram.programId,
			name: "unknown",
			accounts: instruction.keys,
			args: { unknown: instruction.data },
		};
}

function decodeAssociatedTokenInstruction(instruction: TransactionInstruction): ParsedInstruction<AssociatedTokenProgramIdlLike> {
	return {
		name: "createAssociatedTokenAccount",
		accounts: [
			{ name: "fundingAccount", ...instruction.keys[0] },
			{ name: "newAccount", ...instruction.keys[1] },
			{ name: "wallet", ...instruction.keys[2] },
			{ name: "tokenMint", ...instruction.keys[3] },
			{ name: "systemProgram", ...instruction.keys[4] },
			{ name: "tokenProgram", ...instruction.keys[5] },
			...[instruction.keys.length > 5 ? { name: "rentSysvar", ...instruction.keys[6] } : undefined],
		],
		args: {},
		programId: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
	} as ParsedInstruction<AssociatedTokenProgramIdlLike, "createAssociatedTokenAccount">;
}

function flattenIdlAccounts(accounts: IdlAccountItem[], prefix?: string): IdlAccount[] {
	return accounts
		.map((account) => {
			const accName = account.name;
			if (Object.prototype.hasOwnProperty.call(account, "accounts")) {
				const newPrefix = prefix ? `${prefix} > ${accName}` : accName;

				return flattenIdlAccounts((<IdlAccounts>account).accounts, newPrefix);
			} else {
				return {
					...(<IdlAccount>account),
					name: prefix ? `${prefix} > ${accName}` : accName,
				};
			}
		})
		.flat();
}

/**
 * Class for parsing arbitrary solana transactions in various formats
 * - by txHash
 * - from raw transaction data (base64 encoded or buffer)
 * - @solana/web3.js getTransaction().message object
 * - @solana/web3.js getParsedTransaction().message or Transaction.compileMessage() object
 * - @solana/web3.js TransactionInstruction object
 */
export class SolanaParser {
	private instructionParsers: InstructionParsers;

	/**
	 * Initializes parser object
	 * `SystemProgram`, `TokenProgram` and `AssociatedTokenProgram` are supported by default
	 * but may be overriden by providing custom idl/custom parser
	 * @param programInfos list of objects which contains programId and corresponding idl
	 * @param parsers list of pairs (programId, custom parser)
	 */
	constructor(programInfos: ProgramInfoType[], parsers?: InstructionParserInfo[]) {
		const standartParsers: InstructionParserInfo[] = [
			[SystemProgram.programId.toBase58(), decodeSystemInstruction],
			[spl.ASSOCIATED_TOKEN_PROGRAM_ID.toBase58(), decodeAssociatedTokenInstruction],
		];
		let result: InstructionParsers;
		parsers = parsers || [];
		for (const programInfo of programInfos) {
			parsers.push(this.buildIdlParser(new PublicKey(programInfo.programId), programInfo.idl));
		}

		if (!parsers) {
			result = new Map(standartParsers);
		} else {
			// first set provided parsers
			result = new Map(parsers);
			// append standart parsers if parser not exist yet
			for (const parserInfo of standartParsers) {
				if (!result.has(parserInfo[0])) {
					result.set(...parserInfo);
				}
			}
		}

		this.instructionParsers = result;
	}

	/**
	 * Adds (or updates) parser for provided programId
	 * @param programId program id to add parser for
	 * @param parser parser to parse programId instructions
	 */
	addParser(programId: PublicKey, parser: ParserFunction<Idl, string>) {
		this.instructionParsers.set(programId.toBase58(), parser);
	}

	/**
	 * Adds (or updates) parser for provided programId
	 * @param programId program id to add parser for
	 * @param idl IDL that describes anchor program
	 */
	addParserFromIdl(programId: PublicKey | string, idl: Idl) {
		this.instructionParsers.set(...this.buildIdlParser(new PublicKey(programId), idl));
	}

	private buildIdlParser(programId: PublicKey, idl: Idl): InstructionParserInfo {
		const idlParser: ParserFunction<typeof idl, InstructionNames<typeof idl>> = (instruction: TransactionInstruction) => {
			const coder = new BorshInstructionCoder(idl);
			const parsedIx = coder.decode(instruction.data);
			if (!parsedIx) {
				return this.buildUnknownParsedInstruction(instruction.programId, instruction.keys, instruction.data);
			} else {
				const ix = idl.instructions.find((instr) => instr.name === parsedIx.name);
				if (!ix) {
					return this.buildUnknownParsedInstruction(instruction.programId, instruction.keys, instruction.data, parsedIx.name);
				}
				const flatIdlAccounts = flattenIdlAccounts(<IdlAccountItem[]>ix.accounts);
				const accounts = instruction.keys.map((meta, idx) => {
					if (idx < flatIdlAccounts.length) {
						return {
							name: flatIdlAccounts[idx].name,
							...meta,
						};
					}
					// "Remaining accounts" are unnamed in Anchor.
					else {
						return {
							name: `Remaining ${idx - flatIdlAccounts.length}`,
							...meta,
						};
					}
				});

				return {
					name: parsedIx.name,
					accounts,
					programId: instruction.programId,
					args: parsedIx.data as ParsedIdlArgs<typeof idl, typeof idl["instructions"][number]["name"]>, // as IxArgsMap<typeof idl, typeof idl["instructions"][number]["name"]>,
				};
			}
		};

		return [programId.toBase58(), idlParser.bind(this)];
	}

	/**
	 * Removes parser for provided program id
	 * @param programId program id to remove parser for
	 */
	removeParser(programId: PublicKey) {
		this.instructionParsers.delete(programId.toBase58());
	}

	private buildUnknownParsedInstruction(programId: PublicKey, accounts: AccountMeta[], argData: unknown, name?: string): UnknownInstruction {
		return {
			programId,
			accounts,
			args: { unknown: argData },
			name: name || "unknown",
		};
	}

	/**
	 * Parses instruction
	 * @param instruction transaction instruction to parse
	 * @returns parsed transaction instruction or UnknownInstruction
	 */
	parseInstruction<I extends Idl, IxName extends InstructionNames<I>>(instruction: TransactionInstruction): ParsedInstruction<I, IxName> {
		if (!this.instructionParsers.has(instruction.programId.toBase58())) {
			return this.buildUnknownParsedInstruction(instruction.programId, instruction.keys, instruction.data);
		} else {
			const parser = this.instructionParsers.get(instruction.programId.toBase58()) as ParserFunction<I, IxName>;

			return parser(instruction);
		}
	}

	/**
	 * Parses transaction data
	 * @param txMessage message to parse
	 * @returns list of parsed instructions
	 */
	parseTransactionData(txMessage: Message): ParsedInstruction<Idl, string>[] {
		const parsedAccounts = parseTransactionAccounts(txMessage);

		return txMessage.instructions.map((instruction) => this.parseInstruction(compiledInstructionToInstruction(instruction, parsedAccounts)));
	}

	/**
	 * Parses transaction data retrieved from Connection.getParsedTransaction
	 * @param txParsedMessage message to parse
	 * @returns list of parsed instructions
	 */
	parseTransactionParsedData(txParsedMessage: ParsedMessage): ParsedInstruction<Idl, string>[] {
		const parsedAccounts = txParsedMessage.accountKeys.map((metaLike) => ({
			isSigner: metaLike.signer,
			isWritable: metaLike.writable,
			pubkey: metaLike.pubkey,
		}));

		return txParsedMessage.instructions.map((parsedIx) =>
			this.parseInstruction(parsedInstructionToInstruction(parsedIx as PartiallyDecodedInstruction, parsedAccounts)),
		);
	}

	/**
	 * Fetches tx from blockchain and parses it
	 * @param connection web3 Connection
	 * @param txId transaction id
	 * @param flatten - true if CPI calls need to be parsed too
	 * @returns list of parsed instructions
	 */
	async parseTransaction(connection: Connection, txId: string, flatten: boolean = false): Promise<ParsedInstruction<Idl, string>[] | null> {
		const transaction = await connection.getTransaction(txId, { commitment: "confirmed" });
		if (!transaction) return null;
		if (flatten) {
			const flattened = flattenTransactionResponse(transaction);

			return flattened.instructions.map((ix) => this.parseInstruction(ix));
		}

		return this.parseTransactionData(transaction.transaction.message);
	}

	/**
	 * Parses transaction dump
	 * @param txDump base64-encoded string or raw Buffer which contains tx dump
	 * @returns list of parsed instructions
	 */
	parseTransactionDump(txDump: string | Buffer): ParsedInstruction<Idl, string>[] {
		if (!(txDump instanceof Buffer)) txDump = Buffer.from(txDump, "base64");
		const tx = Transaction.from(txDump);
		const message = tx.compileMessage();

		return this.parseTransactionData(message);
	}
}
