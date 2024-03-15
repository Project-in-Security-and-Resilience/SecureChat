# Use a Node.js base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Install mkcert
RUN apt-get update && apt-get install -y mkcert

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./
# COPY localhost-key.pem ./
# COPY localhost.pem ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Expose the port on which the application will run
EXPOSE 8000

# Command to run the application
CMD ["yarn", "dev","--","--host"]
