import dynamic from "next/dynamic";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEntreprenerdzProgram } from "@/hooks/useEntreprenerdzProgram";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalState";
import { Dialog, Menu, Switch, Transition } from "@headlessui/react";
import { RxChevronDown, RxDiscordLogo, RxExit, RxPlusCircled, RxSquare } from "react-icons/rx";
import { shortenPublicKey } from "@/utils";
import clsx from "clsx";
import { useHandleCreateNonce } from "@/hooks/useHandleCreateNonce";
import { WalletDisconnectButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { toast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useHandleVerifyWallet } from "@/hooks/useHandleVerifyWallet";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);



export default function Header() {
  const { data: session, update } = useSession();

  const { publicKey, signMessage, signTransaction, disconnect } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useEntreprenerdzProgram(connection, wallet);
  const globalState = useGlobalState(program);
  const handleCreateNonce = useHandleCreateNonce();
  const handleVerifyWallet = useHandleVerifyWallet();

  const [isAdmin, setAdmin] = useState(false);
  const [totalStakes, setTotalStakes] = useState<number>();
  const [isVerifyOpen, setVerifyOpen] = useState<boolean>(false);
  const [isLedger, setLedger] = useState<boolean>(false);

  const verified = useMemo(() => {
    if (session && session.user.wallet && publicKey) {
      if (session.user.wallet == publicKey.toString()) {
        return true;
      }
    }

    return false;
  }, [
    session,
    publicKey
  ])

  useEffect(() => {
    const fetchStakeAccounts = async () => {
      if (program && publicKey) {
        const stakeAccounts = await program.account.stakeAccount.all([
          {
            memcmp: {
              offset: 16,
              bytes: publicKey.toString(),
            },
          },
        ]);
        setTotalStakes(stakeAccounts.length);
      } else {
        setTotalStakes(0);
      }
    };

    fetchStakeAccounts();
  }, [program, publicKey]);

  useEffect(() => {
    if (publicKey) {
      if (globalState && globalState.authority.equals(publicKey)) {
        setAdmin(true);
        return;
      } else if (!globalState) {
        setAdmin(true);
        return;
      }
    }

    setAdmin(false);
  }, [globalState, publicKey]);

  const onVerifyWallet = async () => {

    if (!session) {
      toast.error("You need to login Discord");
      return;
    }

    if (!publicKey || !signMessage) {
      toast.error("Wallet not connected");
      return;
    }

    const address = publicKey?.toBase58();

    if (!address) {
      toast.error("Wallet not connected");
      return
    }

    const toastId = toast.loading("Verify wallet in progress...")

    try {
      const { nonce } = await handleCreateNonce.mutateAsync({ address });

      const message = `Verify wallet ownership by signing this message \n Nonce: ${nonce}`;
      const messageRaw = new TextEncoder().encode(message);
      const signedMessageRaw = await signMessage(messageRaw);
      const signedMessage = bs58.encode(signedMessageRaw);

      handleVerifyWallet.mutate({
        address,
        signedMessage,
      }, {
        onSuccess: (user) => {
          console.log(user)
          toast.success('Verify wallet successed', {
            id: toastId
          })
          setVerifyOpen(false)
          update({ wallet: user.wallet })
        },
        onError: (err) => {
          toast.error('Verify wallet failed', {
            id: toastId
          })
        }
      });
    }
    catch (ex) {
      console.log(ex);
      toast.error('Verify wallet failed', {
        id: toastId
      })
    }

  };

  const onVerifyLedgerWallet = async () => {
    if (!session) {
      toast.error("You need to login Discord");
      return;
    }

    if (!publicKey || !signTransaction) {
      toast.error("Wallet not connected");
      return;
    }

    const toastId = toast.loading("Verify wallet in progress...")

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0.001 * LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = publicKey;
      const blockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      const txRes = await connection.confirmTransaction({
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature: signature,
      });

      if (txRes.value.err) {
        toast.error('Verify failed, please make sure you have enough SOL in your wallet', {
          id: toastId
        })
        return;
      }

      handleVerifyWallet.mutate({
        address: publicKey.toString(),
        memoTx: signature
      }, {
        onSuccess: (user) => {
          console.log(user)
          toast.success('Verify wallet successed', {
            id: toastId
          })
          setVerifyOpen(false)
          update({ wallet: user.wallet })
        },
        onError: (err) => {
          toast.error('Verify wallet failed', {
            id: toastId
          })
        }
      });
    }
    catch (ex) {
      console.log(ex);
      toast.error('Verify wallet failed', {
        id: toastId
      })
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-4 py-6">
        <Link href={"/"} className="pr-8">
          <img src="/images/logo.png" alt="GigaDex" />
        </Link>

        <div className="flex gap-8 items-center text-gray-300 flex-1">
          <Link href={"/"}>
            <span className="text-xl">Home</span>
          </Link>
          <Link href={"/stake"}>
            <span className="text-xl">Stake ({totalStakes})</span>
          </Link>
          {isAdmin ? (
            <Link href={"/admin"}>
              <span className="text-xl">Admin</span>
            </Link>
          ) : null}
        </div>

        {session ? (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg px-4 py-2 text-md font-medium text-white bg-blue-500 hover:bg-blue-400">
              <RxDiscordLogo />
              <span>{session.user.name}</span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-lg bg-blue-500 hover:bg-blue-400">
                <div className="py-1 justify-start items-center w-full">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={clsx(
                          active
                            ? "bg-dark-500 text-gray-100"
                            : "text-gray-200",
                          "flex justify-center p-2 text-sm rounded-lg mx-1"
                        )}
                        onClick={() => signOut()}
                      >
                        <p className="flex align-center text-white">
                          <RxExit className="mr-2 h-5 w-5" />
                          Logout
                        </p>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        ) : (
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-400 rounded-md text-white font-semibold px-4 py-2 flex gap-2 h-fit items-center"
            onClick={() => signIn()}
          >
            <RxDiscordLogo />
            <span>Login</span>
          </button>
        )}

        {
          publicKey ?
            (verified ?
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg px-4 py-2 text-md font-medium text-white bg-blue-500 hover:bg-blue-400">
                  {shortenPublicKey(publicKey.toBase58())}
                  <RxChevronDown
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-lg bg-blue-500 hover:bg-blue-400">
                    <div className="py-1 justify-start items-center w-full">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active
                                ? "bg-dark-500 text-gray-100"
                                : "text-gray-200",
                              "flex justify-center p-2 text-sm rounded-lg mx-1"
                            )}
                            onClick={() => disconnect()}
                          >
                            <p className="flex align-center text-white">
                              <RxExit className="mr-2 h-5 w-5" />
                              Disconnect
                            </p>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              : <button
                type="button"
                className="bg-blue-500 hover:bg-blue-400 rounded-md text-white font-semibold px-4 py-2 flex gap-2 h-fit items-center"
                onClick={() => setVerifyOpen(true)}>
                Verify wallet
              </button>
            )
            : <WalletMultiButtonDynamic />
        }
      </div>

      <Transition appear show={isVerifyOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setVerifyOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="flex justify-between">
                    <p className="text-lg font-medium leading-6 text-white">
                      Verify Wallet ({shortenPublicKey(publicKey?.toString())})
                    </p>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setVerifyOpen(false)}
                    >
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-md text-white">
                      Verify wallet to approve ownership and claim rewards.
                    </p>

                    <div className="flex gap-2 my-4">
                      <Switch
                        checked={isLedger}
                        onChange={setLedger}
                        className={`${isLedger ? 'bg-teal-900' : 'bg-teal-700'}
                          relative inline-flex h-[28px] w-[54px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                      >
                        <span
                          aria-hidden="true"
                          className={`${isLedger ? 'translate-x-7' : 'translate-x-0'}
                            pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                      <span className="text-white">Using Ledger</span>
                    </div>

                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg bg-gray-500 px-4 py-3 text-xs font-medium text-gray-200 hover:bg-white hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setVerifyOpen(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg bg-blue-500 px-4 py-3 text-xs font-medium text-white hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        isLedger ? onVerifyLedgerWallet() : onVerifyWallet()
                      }}
                    >
                      Verify Wallet
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}
