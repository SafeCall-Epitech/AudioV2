# Base image
FROM node:latest

# Create and set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port on which the application will listen
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
