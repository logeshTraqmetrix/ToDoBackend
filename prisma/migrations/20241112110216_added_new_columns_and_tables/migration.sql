-- CreateTable
CREATE TABLE "MainToDo" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "isSubToDoExists" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MainToDo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubToDo" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "mainToDoId" TEXT NOT NULL,

    CONSTRAINT "SubToDo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MainToDo" ADD CONSTRAINT "MainToDo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubToDo" ADD CONSTRAINT "SubToDo_mainToDoId_fkey" FOREIGN KEY ("mainToDoId") REFERENCES "MainToDo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
