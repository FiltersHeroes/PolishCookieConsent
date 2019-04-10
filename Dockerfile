FROM circleci/golang:1-node

RUN go get github.com/tcnksm/ghr
RUN sudo npm install --save @wext/shipit
