provider = "mongodb"
url = env("DATABASE_URL")
model Note {
id String @id @default(auto()) @map("\_id") @db.ObjectId
content String
createAt DateTime @default(now()) @map("create_at")
tags NoteTag[]
}

model Tag {
id String @id @default(auto()) @map("\_id") @db.ObjectId
title String
notes NoteTag[]
}

model NoteTag {
id String @id @default(auto()) @map("\_id") @db.ObjectId
noteId String @db.ObjectId
tagId String @db.ObjectId

note Note @relation(fields: [noteId], references: [id])
tag Tag @relation(fields: [tagId], references: [id])

@@index([noteId], name: "noteId_idx")
@@index([tagId], name: "tagId_idx")
}
