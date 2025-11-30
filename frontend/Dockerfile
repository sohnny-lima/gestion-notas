# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto donde corre Vite
EXPOSE 5173

# Ejecutar modo desarrollo accesible desde afuera
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
