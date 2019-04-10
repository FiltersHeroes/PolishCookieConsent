FROM circleci/golang:1-node

RUN go get github.com/tcnksm/ghr
RUN npm set prefix=/home/circleci/npm && echo 'export PATH=$HOME/circleci/npm/bin:$PATH' >> /home/circleci/.bashrc
RUN npm install -g @wext/shipit
