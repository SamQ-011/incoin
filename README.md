# 🎓 INCOIN — Sistema Descentralizado de Credenciales Académicas Soulbound

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?logo=solidity)](https://soliditylang.org/)
[![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia_Testnet-627EEA?logo=ethereum)](https://sepolia.etherscan.io/address/0xd60b490890afc529ca3bbe55059215a0636d79de)
[![ERC-5192](https://img.shields.io/badge/Standard-ERC--5192_Soulbound-8A2BE2)](https://eips.ethereum.org/EIPS/eip-5192)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**INCOIN** es una plataforma descentralizada diseñada para emitir, gestionar y verificar credenciales académicas infalsificables en la blockchain de Ethereum (Sepolia Testnet), utilizando el estándar **ERC-5192 (Soulbound Tokens / SBT)** y **ERC-721**.

El objetivo principal es erradicar la falsificación de títulos universitarios, certificaciones técnicas, diplomados y pasantías, garantizando la titularidad de los estudiantes y ofreciendo a empleadores e instituciones una herramienta de verificación pública, transparente e instantánea mediante códigos QR y hashes criptográficos on-chain.

---

## 🚀 Características Principales

### 1. 🔒 Tokens Soulbound (ERC-5192 / ERC-721)
- Las credenciales emitidas están ancladas de forma permanente e **intransferible** a la dirección de wallet del estudiante.
- Implementa la interfaz estándar `IERC5192` (`locked(uint256)` siempre retorna `true`). Cualquier intento de transferencia vía `transferFrom` o `safeTransferFrom` es revertido a nivel de smart contract con el error personalizado `SoulboundTokenNonTransferable()`.

### 2. 🏛️ Emisión Individual y Masiva (Batch)
- **Emisión Individual**: Formulario interactivo para registrar títulos, certificados y diplomados asignados a un estudiante.
- **Emisión Masiva (Batch Issuance)**: Importación de archivos CSV para graduaciones masivas con cómputo automático de hashes SHA-256 / Keccak-256 e invocación en bloque (`batchIssueCredentials`) para optimizar costos de gas.

### 3. 🔍 Verificador On-Chain con Escaneo QR
- Módulo público de verificación que consulta el estado directamente en la blockchain de Sepolia.
- Soporte para validación por **Token ID**, **Hash de Integridad** y lectura de **Códigos QR** impresos en certificados físicos o digitales.
- Muestra el estado de la credencial en tiempo real: *Válida*, *Revocada*, Emisor Autorizado, Fecha de emisión, Carga Horaria y Transacción en Etherscan.

### 4. 🌐 Red Institucional & Gobernanza
- Sistema de control de acceso basado en roles (`AccessControl` de OpenZeppelin):
  - `DEFAULT_ADMIN_ROLE`: Administrador de la plataforma, autoriza y revoca instituciones.
  - `ISSUER_ROLE`: Permiso exclusivo otorgado a universidades, institutos técnicos y entidades de formación autorizadas para acuñar credenciales oficiales.
- Directorio de instituciones aliadas verificadas con metadata y contratos asociados.

### 5. 💼 Portafolio Web3 & Generador de CV Académico
- Portal para estudiantes donde pueden conectar su wallet (MetaMask, WalletConnect, etc.) y visualizar todas sus certificaciones verificadas.
- Generación de CV Web3 descargable y vista de certificado con firma criptográfica digital.

### 6. 🏷️ Badges Dinámicos SVG & API de Metadatos
- API nativa que genera insignias e imágenes vectoriales dinámicas en SVG (`/api/badges/[tokenId]`) listas para incrustar en sitios web, perfiles de GitHub o plataformas de contratación.
- Endpoint de metadatos ERC-721 compatible con marketplaces y exploradores (`/api/metadata/[tokenId]`).

### 7. 🧪 Laboratorio Interactivo Soulbound (Demo)
- Entorno de pruebas integrado para interactuar con contratos y comprobar en vivo la imposibilidad de transferir una credencial académica a un tercero.

---

## 🏗️ Arquitectura del Sistema

```
incoin/
├── contracts/                     # Smart Contracts y Scripts Hardhat
│   ├── contracts/
│   │   ├── InCoinCredential.sol   # Contrato principal Soulbound ERC-5192
│   │   └── interfaces/
│   │       └── IERC5192.sol       # Interfaz del estándar ERC-5192
│   ├── deployments/
│   │   └── sepolia.json           # Registro de despliegue en Sepolia
│   ├── scripts/
│   │   ├── deploy-sepolia.js      # Script de despliegue a Sepolia
│   │   ├── grant-issuer-sepolia.js# Otorgar rol ISSUER_ROLE
│   │   └── set-base-uri-sepolia.js# Configuración de Base URI
│   └── hardhat.config.js          # Configuración de Hardhat (Viem)
│
└── frontend/                      # Aplicación Web Next.js 16
    ├── prisma/
    │   └── schema.prisma          # Modelos de Base de Datos PostgreSQL
    ├── public/                    # Assets estáticos y logos
    └── src/
        ├── app/
        │   ├── api/               # API Routes (Metadata, Badges, Certificados)
        │   ├── certificate/       # Vista e impresión de certificado oficial
        │   ├── cv/                # Portafolio / CV público verificado
        │   ├── governance/        # Gestión de gobernanza y emisores
        │   ├── issuer/            # Panel de emisión (Single & Batch CSV)
        │   ├── soulbound-demo/    # Demo interactiva de intransferibilidad
        │   ├── student/           # Panel del estudiante / portafolio
        │   └── verify/            # Verificador público QR y Token ID
        ├── components/            # Componentes reutilizables UI
        ├── contracts/             # ABIs y direcciones de contratos
        └── lib/                   # Hooks Web3 (Viem/Wagmi), Prisma Client
```

---

## 📜 Detalles del Smart Contract (Sepolia Testnet)

- **Nombre del Contrato**: `InCoinCredential`
- **Símbolo**: `INCOIN`
- **Red**: Ethereum Sepolia Testnet (`chainId: 11155111`)
- **Dirección del Contrato**: [`0xd60b490890afc529ca3bbe55059215a0636d79de`](https://sepolia.etherscan.io/address/0xd60b490890afc529ca3bbe55059215a0636d79de)
- **Bloque de Despliegue**: `11575560`
- **Estándares Soportados**:
  - `ERC-721` (Non-Fungible Token Standard)
  - `ERC-721Enumerable`
  - `ERC-5192` (Minimal Soulbound NFTs)
  - `AccessControl` (OpenZeppelin Role-Based Permissions)
  - `Pausable` (Seguridad para emergencias)

### Tipos de Credenciales Soportadas
| Enum ID | Tipo de Credencial | Descripción |
|---|---|---|
| `0` | `ACADEMIC_DEGREE` | Títulos universitarios y técnicos superiores |
| `1` | `CERTIFICATION` | Certificaciones profesionales y cursos de especialización |
| `2` | `DIPLOMA` | Diplomados y programas de postgrado |
| `3` | `INTERNSHIP` | Pasantías laborales y prácticas pre-profesionales |
| `4` | `VOLUNTEERING` | Voluntariados y reconocimientos de extensión social |

---

## ⚙️ Requisitos Previos

- [Node.js](https://nodejs.org/) v18.0.0 o superior
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io/)
- Billetera Web3 ([MetaMask](https://metamask.io/) o compatible)
- Fondos de prueba en Sepolia Faucet (para despliegues o interacción con transacciones de emisión)
- Base de datos PostgreSQL (local o vía Supabase)

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/SamQ-011/incoin.git
cd incoin
```

### 2. Configurar y desplegar Smart Contracts (`/contracts`)

```bash
cd contracts
npm install
```

Crea un archivo `.env` basado en `.env.example`:

```env
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
PRIVATE_KEY="tu_clave_privada_aqui"
```

Comandos disponibles:
```bash
# Compilar contratos
npx hardhat compile

# Ejecutar tests
npx hardhat test

# Desplegar en Sepolia
node scripts/deploy-sepolia.js

# Otorgar rol de emisor a una institución
node scripts/grant-issuer-sepolia.js
```

### 3. Configurar y levantar el Frontend (`/frontend`)

```bash
cd ../frontend
npm install
```

Crea un archivo `.env` en la carpeta `frontend/`:

```env
# Base de datos PostgreSQL (ej. Supabase)
DATABASE_URL="postgresql://usuario:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:password@host:5432/postgres"

# Contrato Inteligente Sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS="0xd60b490890afc529ca3bbe55059215a0636d79de"
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS="0xd60b490890afc529ca3bbe55059215a0636d79de"
NEXT_PUBLIC_CHAIN_ID="11155111"
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
```

Generar el cliente de base de datos e iniciar el servidor de desarrollo:

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones (si aplica)
npx prisma db push

# Iniciar servidor Next.js
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📊 Formato de Emisión Batch (CSV)

Para emitir credenciales masivamente en `/issuer`, utiliza un archivo `.csv` con la siguiente estructura de columnas:

```csv
walletAddress,fullName,identityNumber,career,title,credentialType,hours,description
0x742d35Cc6634C0532925a3b844Bc454e4438f44e,Carlos Quispe Mamani,8472910 LP,Sistemas Informáticos,Técnico Superior en Sistemas Informáticos,ACADEMIC_DEGREE,3600,Graduación por Excelencia Académica
0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5,María Choque Flores,9123847 LP,Contaduría General,Diplomado en Auditoría Financiera,DIPLOMA,450,Módulo Avanzado NIIF
```

---

## 🔒 Seguridad y Buenas Prácticas

- **Acceso Restringido**: Únicamente las billeteras con `ISSUER_ROLE` pueden invocar `issueCredential` y `batchIssueCredentials`.
- **Inmutabilidad y Revocación**: Si una credencial contiene un error o requiere ser anulada por causas justificadas, sólo la entidad que la emitió puede ejecutar `revokeCredential(tokenId, reason)`. La revocación queda registrada con evento on-chain y no destruye el historial.
- **Integridad de Datos**: Los detalles extendidos se protegen mediante el hash Keccak256 `metadataHash` almacenado on-chain, asegurando que los registros off-chain no hayan sido alterados.

---

## 👥 Equipo y Licencia

Desarrollado para la modernización y certificación académica digital.

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.
