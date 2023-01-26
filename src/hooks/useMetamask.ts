import { useState } from 'react';
import { disconnect, toggleLoading } from '../store/nftsReducer';
import { connectWallet, disconnectWallet } from '../store/walletReducer';
import { useAppDispatch } from './useAppDispatch';
import { useNFTs } from './useNFTs';

interface UseMetamask {
  errorMessage: string | null
  connectHandler: () => void
  chainChanged: () => void
  accountChanged: (address: string) => void
}

export const useMetamask = (): UseMetamask => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { fetch } = useNFTs();
	const dispatch = useAppDispatch();

	const accountChanged = async (address: string): Promise<void> => {
		dispatch(toggleLoading({ isLoading: true }));
		//@ts-expect-error out of typescript scope
		const chainId = window.ethereum.chainId;
		dispatch(connectWallet({ address, chainId }));
		const { error } = await fetch(address);
		dispatch(toggleLoading({ isLoading: false }));
		if (error) {
			setErrorMessage(error);
		}
	};

	const chainChanged = (): void => {
		setErrorMessage(null);
		dispatch(disconnectWallet());
		dispatch(disconnect());
	};

	const connectHandler = async (): Promise<void> => {
		//@ts-expect-error out of typescript scope
		if (window.ethereum) {
			try {
				//@ts-expect-error out of typescript scope
				const res = await window.ethereum.request({
					method: 'eth_requestAccounts',
				});
				await accountChanged(res[0]);
			} catch (err) {
				console.error(err);
				setErrorMessage('There was a problem connecting to MetaMask');
			}
		} else {
			setErrorMessage('Install MetaMask');
		}
	};

	return {
		errorMessage,
		connectHandler,
		chainChanged,
		accountChanged,
	};
};
