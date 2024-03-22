'use client';
import {
  CryptoDevsDAOABI,
  CryptoDevsDAOAddress,
  CryptoDevsNFTABI,
  CryptoDevsNFTAddress,
} from '@/constants';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import styles from '@/app/page.module.css';
import { Inter } from 'next/font/google';
import { config } from '@/app/provider';
import { readContract } from '@wagmi/core';

const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  const {
    data: hash,
    writeContract,
    error: writrContractError,
  } = useWriteContract();

  const numOfProposalsInDAO = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: 'numProposals',
  });

  // Function to vote YAY or NAY on a proposal
  async function voteForProposal(proposalId, vote) {
    setLoading(true);
    try {
      const tx = writeContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'voteOnProposal',
        args: [proposalId, vote === 'YAY' ? 0 : 1],
      });

      //   useWaitForTransactionReceipt({ hash });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to execute a proposal after deadline has been exceeded
  async function executeProposal(proposalId) {
    setLoading(true);
    try {
      const tx = writeContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'executeProposal',
        args: [proposalId],
      });

      //   await waitForTransactionReceipt(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  console.log('test', parseInt(numOfProposalsInDAO?.data?.toString()));

  useEffect(() => {
    async function fetchProposals() {
      const numOfproposal = parseInt(numOfProposalsInDAO?.data?.toString());
      try {
        const proposalPromises = Array.from({ length: numOfproposal }, (_, i) =>
          readContract(config, {
            address: CryptoDevsDAOAddress,
            abi: CryptoDevsDAOABI,
            functionName: 'proposals',
            args: [i],
          })
        );

        const proposalResults = await Promise.all(proposalPromises);

        const parsedProposals = proposalResults.map((proposalsingle, i) => {
          const [nftTokenId, deadline, yayVotes, nayVotes, executed] =
            proposalsingle;
          return {
            proposalId: i,
            nftTokenId: nftTokenId.toString(),
            deadline: new Date(parseInt(deadline.toString()) * 1000),
            yayVotes: yayVotes.toString(),
            nayVotes: nayVotes.toString(),
            executed: Boolean(executed),
          };
        });

        setProposals(parsedProposals);
      } catch (error) {
        console.error(error);
        window.alert(error);
      }
    }

    fetchProposals();
  }, []);

  console.log('proposals components');
  console.log('array of proposals', proposals);
  return (
    <div>
      {proposals.map((p, index) => (
        <div key={index} className={styles.card}>
          <p>Proposal ID: {p?.proposalId?.toString()}</p>
          <p>Fake NFT to Purchase: {p.nftTokenId}</p>
          <p>Deadline: {p.deadline.toLocaleString()}</p>
          <p>Yay Votes: {p.yayVotes}</p>
          <p>Nay Votes: {p.nayVotes}</p>
          <p>Executed?: {p.executed.toString()}</p>
          {p.deadline.getTime() > Date.now() && !p.executed ? (
            <div className={styles.flex}>
              <button
                className={styles.button2}
                onClick={() => voteForProposal(p.proposalId, 'YAY')}
              >
                Vote YAY
              </button>
              <button
                className={styles.button2}
                onClick={() => voteForProposal(p.proposalId, 'NAY')}
              >
                Vote NAY
              </button>
            </div>
          ) : p.deadline.getTime() < Date.now() && !p.executed ? (
            <div className={styles.flex}>
              <button
                className={styles.button2}
                onClick={() => executeProposal(p.proposalId)}
              >
                Execute Proposal {p.yayVotes > p.nayVotes ? '(YAY)' : '(NAY)'}
              </button>
            </div>
          ) : (
            <div className={styles.description}>Proposal Executed</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProposalList;

