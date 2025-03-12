-- CreateTable
CREATE TABLE "Signup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Signup_pkey" PRIMARY KEY ("id")
);
