FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Cài đặt dependencies
RUN yarn install

# Copy source code
COPY . .

# Build ứng dụng
RUN yarn build

# Expose port
EXPOSE 3000

# Start command
CMD ["yarn", "start"] 