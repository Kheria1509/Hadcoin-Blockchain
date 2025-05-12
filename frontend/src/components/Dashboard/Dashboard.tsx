import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlockAnimation } from './BlockAnimation';
import axios from 'axios';

interface BlockchainInfo {
  chain_length: number;
  pending_transactions: number;
  nodes: string[];
}

export function Dashboard() {
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockchainInfo = async () => {
      try {
        const [chainResponse, nodesResponse] = await Promise.all([
          axios.get('http://localhost:5001/get_chain'),
          axios.get('http://localhost:5001/get_nodes')
        ]);

        setBlockchainInfo({
          chain_length: chainResponse.data.length,
          pending_transactions: chainResponse.data.pending_transactions?.length || 0,
          nodes: nodesResponse.data.nodes || []
        });
      } catch (error) {
        console.error('Error fetching blockchain info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainInfo();
    const interval = setInterval(fetchBlockchainInfo, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMineBlock = async () => {
    try {
      await axios.get('http://localhost:5001/mine_block');
      // Refresh blockchain info after mining
      const chainResponse = await axios.get('http://localhost:5001/get_chain');
      setBlockchainInfo(prev => ({
        ...prev!,
        chain_length: chainResponse.data.length,
        pending_transactions: chainResponse.data.pending_transactions?.length || 0
      }));
    } catch (error) {
      console.error('Error mining block:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="h-[60vh]">
        <BlockAnimation />
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Blockchain Stats */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Blockchain Stats</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Chain Length</p>
                  <p className="text-2xl font-bold">{blockchainInfo?.chain_length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Pending Transactions</p>
                  <p className="text-2xl font-bold">{blockchainInfo?.pending_transactions || 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Network Status */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Network Status</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div>
                <p className="text-gray-400">Connected Nodes</p>
                <p className="text-2xl font-bold">{blockchainInfo?.nodes.length || 0}</p>
                <div className="mt-4 space-y-2">
                  {blockchainInfo?.nodes.map((node, index) => (
                    <div key={index} className="text-sm text-gray-400">
                      {node}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <button
                onClick={handleMineBlock}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                Mine Block
              </button>
              <button
                onClick={() => window.location.href = '/transaction'}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                New Transaction
              </button>
              <button
                onClick={() => window.location.href = '/explorer'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                View Chain
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 