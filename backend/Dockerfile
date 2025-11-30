# backend/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# --- NUEVA LÍNEA ---
# Definimos una URL falsa solo para que el comando generate funcione.
# No te preocupes, cuando arranque de verdad usará la del docker-compose.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# -------------------

# Ahora sí, generamos el cliente
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]