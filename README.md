# Hadcoin-Blockchain

Hadcoin is a basic implementation of a blockchain and a cryptocurrency built using Python and Flask. This project includes functionalities to create blocks, add transactions, mine new blocks, validate the blockchain, and support decentralization through multiple nodes.

---

## Features

- Create and mine new blocks
- Add transactions to the blockchain
- Validate the blockchain
- Connect multiple nodes for decentralization
- Replace the chain with the longest valid chain in the network

---

## Installation

## Prerequisites

- Python 3.x
- Flask 0.12.2: `pip install Flask==0.12.2`
- Requests 2.18.4: `pip install requests==2.18.4`
- Postman HTTP Client (for testing API endpoints): [Postman](https://www.getpostman.com/)

### Running the Main Node

1. Clone the repository:
    ```sh
    git clone https://github.com/Kheria1509/Hadcoin-Blockchain.git
    cd Hadcoin-Blockchain
    ```

2. Install the required libraries:
    ```sh
    pip install Flask==0.12.2 requests==2.18.4
    ```

3. Run the main node:
    ```sh
    python hadcoin.py
    ```

---



### Example Commands

- **Create a New Block**:
  ```bash
  python main.py create_block
  ```

- **Mine a New Block**:
  ```bash
  python main.py mine_block
  ```

---

## Contributing

We welcome contributions to this project! Please follow the steps below to get started:

1. **Fork the Repository**:
   Create a copy of this repository on your GitHub account.

2. **Create a New Branch**:
   ```bash
   git checkout -b feature-branch
   ```

3. **Make Your Changes**:
   Implement your changes and ensure they adhere to the coding standards.

4. **Commit Your Changes**:
   ```bash
   git commit -m "Add a descriptive commit message"
   ```

5. **Push the Changes**:
   ```bash
   git push origin feature-branch
   ```

6. **Open a Pull Request**:
   Submit a pull request for review and ensure it adheres to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Feel free to modify this document as per the specific details and requirements of your project.
