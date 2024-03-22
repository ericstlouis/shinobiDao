'use client';
import {
  CryptoDevsDAOABI,
  CryptoDevsDAOAddress,
  CryptoDevsNFTABI,
  CryptoDevsNFTAddress,
} from '@/constants';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem/utils';
import { readContract } from '@wagmi/core';
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import styles from './page.module.css';
import ProposalList from '@/components/proposal';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function Home() {
  // Check if the user's wallet is connected, and it's address using Wagmi's hooks.
  const { address, isConnected } = useAccount();
  // State variable to know if the component has been mounted yet or not
  const [isMounted, setIsMounted] = useState(false);

  // State variable to show loading state when waiting for a transaction to go through
  const [loading, setLoading] = useState(false);

  // Fake NFT Token ID to purchase. Used when creating a proposal.
  const [fakeNftTokenId, setFakeNftTokenId] = useState('');
  // State variable to store all proposals in the DAO
  const [proposals, setProposals] = useState([]);
  // State variable to switch between the 'Create Proposal' and 'View Proposals' tabs
  const [selectedTab, setSelectedTab] = useState('');

  const {
    data: hash,
    writeContract,
    error: writrContractError,
  } = useWriteContract();
  // console.log(writrContractError);

  // Fetch the owner of the DAO
  const daoOwner = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: 'owner',
  });

  console.log('dao Owner', daoOwner?.data?.toString());
  console.log('adress', address);

  // Fetch the balance of the DAO
  const daoBalance = useBalance({
    address: CryptoDevsDAOAddress,
  });

  // Fetch the number of proposals in the DAO
  const numOfProposalsInDAO = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: 'numProposals',
  });
  const numOfproposal = parseInt(numOfProposalsInDAO?.data?.toString());
  console.log(numOfproposal);
  // Fetch the CryptoDevs NFT balance of the user
  const nftBalanceOfUser = useReadContract({
    abi: CryptoDevsNFTABI,
    address: CryptoDevsNFTAddress,
    functionName: 'balanceOf',
    args: [address],
  });

  // Function to make a createProposal transaction in the DAO
  async function createProposal() {
    setLoading(true);

    try {
      const tx = writeContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'createProposal',
        args: [fakeNftTokenId],
      });

      // useWaitForTransactionReceipt({hash});
      // console.log('transaction went!!');
      // console.log(tx);
    } catch (error) {
      console.error(writrContractError);
      window.alert(writrContractError);
    }
    setLoading(false);
  }

  // Function to withdraw ether from the DAO contract
  async function withdrawDAOEther() {
    setLoading(true);
    try {
      const tx = writeContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'withdrawEther',
        args: [],
      });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Render the contents of the appropriate tab based on `selectedTab`
  function renderTabs() {
    if (selectedTab === 'Create Proposal') {
      return renderCreateProposalTab();
    } else if (selectedTab === 'View Proposals') {
      return renderViewProposalsTab();
    }
    return null;
  }

  // Renders the 'Create Proposal' tab content
  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalanceOfUser.data === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }
  // Renders the 'View Proposals' tab content
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (numOfproposal.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          <ProposalList />
        </div>
      );
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div>
        <ConnectButton />
      </div>
    );

  return (
    <div className={inter.className}>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalanceOfUser?.data?.toString()}
            <br />
            {daoBalance.data && (
              <>
                Treasury Balance:{' '}
                {formatEther(daoBalance.data.value).toString()} ETH
              </>
            )}
            <br />
            Total Number of Proposals: {numOfProposalsInDAO?.data?.toString()}
          </div>
          <div className={styles.flex}>
            <button
              className={styles.button}
              onClick={() => setSelectedTab('Create Proposal')}
            >
              Create Proposal
            </button>
            <button
              className={styles.button}
              onClick={() => setSelectedTab('View Proposals')}
            >
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {/* Display additional withdraw button if connected wallet is owner */}
          {address &&
          address.toLowerCase() === daoOwner?.data?.toString().toLowerCase() ? (
            <div>
              {loading ? (
                <button className={styles.button}>Loading...</button>
              ) : (
                <button className={styles.button} onClick={withdrawDAOEther}>
                  Withdraw DAO ETH
                </button>
              )}
            </div>
          ) : (
            'Not owner cant withdraw'
          )}
        </div>
        <div>
          <img className={styles.image} src="https://i.imgur.com/buNhbF7.png" />
        </div>
      </div>
    </div>
  );
}

