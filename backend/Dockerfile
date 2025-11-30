# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# 1) Dependencias
COPY package*.json ./
RUN npm install

# 2) Código
COPY . .

# 3) Definir DATABASE_URL para que Prisma no falle en el build
#    OJO: mismo valor que en docker-compose, pero aquí solo lo usa para generate
# Definimos una URL falsa solo para que el comando generate funcione.
# No te preocupes, cuando arranque de verdad usará la del docker-compose.
ENV DATABASE_URL="postgresql://postgres:LIONcito129@db:5432/gestion_notas?schema=public"

# 4) Generar cliente de Prisma para Linux
RUN npx prisma generate

# 5) Exponer puerto
EXPOSE 3000

# 6) Comando de arranque
CMD ["npm", "run", "dev"]
