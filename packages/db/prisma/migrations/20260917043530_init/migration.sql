-- CreateEnum
CREATE TYPE "FriendsStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "QuestionOperation" AS ENUM ('PLUS', 'MINUS', 'DIVIDE', 'MULTIPLICATION');

-- CreateEnum
CREATE TYPE "GameMemberStatus" AS ENUM ('WON', 'LOST');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('RUNNING', 'SEARCHING_FOR_PLAYER', 'OVER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "GameStatus" NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userAnswer" INTEGER NOT NULL,
    "number1" INTEGER NOT NULL,
    "number2" INTEGER NOT NULL,
    "operation" "QuestionOperation" NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMember" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GameMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friends" (
    "id" TEXT NOT NULL,
    "status" "FriendsStatus" NOT NULL DEFAULT 'PENDING',
    "receiverId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserRating_userId_key" ON "UserRating"("userId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMember" ADD CONSTRAINT "GameMember_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMember" ADD CONSTRAINT "GameMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
