-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('QR', 'NFC', 'RFID', 'PUF');
CREATE TYPE "VerificationStatus" AS ENUM ('AUTHENTIC', 'TAMPERED', 'FAKE');

-- CreateTable
CREATE TABLE "Product" (
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "NFTPassport" (
    "nft_passport_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "token_id" BIGINT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "metadata_hash" TEXT NOT NULL,
    "metadata_cid" TEXT NOT NULL,
    "mint_tx_hash" TEXT NOT NULL,
    "minted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NFTPassport_pkey" PRIMARY KEY ("nft_passport_id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tag_pk" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "nft_passport_id" TEXT NOT NULL,
    "tag_type" "TagType" NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tag_pk")
);

-- CreateTable
CREATE TABLE "ProvenanceEvent" (
    "event_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_description" TEXT,
    "event_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProvenanceEvent_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "verification_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("verification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_serial_number_key" ON "Product"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "NFTPassport_product_id_key" ON "NFTPassport"("product_id");
CREATE UNIQUE INDEX "NFTPassport_token_id_key" ON "NFTPassport"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_id_key" ON "Tag"("tag_id");
CREATE UNIQUE INDEX "Tag_product_id_key" ON "Tag"("product_id");
CREATE UNIQUE INDEX "Tag_nft_passport_id_key" ON "Tag"("nft_passport_id");

-- AddForeignKey
ALTER TABLE "NFTPassport" ADD CONSTRAINT "NFTPassport_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_nft_passport_id_fkey" FOREIGN KEY ("nft_passport_id") REFERENCES "NFTPassport"("nft_passport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvenanceEvent" ADD CONSTRAINT "ProvenanceEvent_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
