FROM ubuntu:latest

RUN apt update

RUN apt install  openssh-server sudo curl nano git -y

RUN apt update

RUN apt install build-essential pkg-config zlib1g-dev libudev-dev llvm libclang-dev protobuf-compiler libssl-dev make -y

RUN apt install nodejs npm -y

RUN npm install -g yarn

#RUN npm install -g mocha
#
#RUN npm install -g ts_node
#
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

RUN cargo install --git https://github.com/project-serum/anchor anchor-cli --locked

RUN solana config set --url localhost

#RUN solana config set --url https://api.devnet.solana.com

#RUN solana-keygen new -o /root/.config/solana/id.json

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1010 sshuser 

RUN usermod -aG sudo sshuser

RUN service ssh start

RUN  echo 'sshuser:password' | chpasswd

RUN mkdir /home/ubuntu/solana-project

EXPOSE 22 8899 8900 3000


CMD ["/usr/sbin/sshd","-D"]
