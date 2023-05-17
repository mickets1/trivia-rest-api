import fse from 'fs-extra'
// @ts-ignore - mongoose includes own TS-types by default.
import { connectDB } from './config/mongoose.js'
import { createModel } from './models/question.js'

/**
 * Parsing script for populating database.
 */
async function parseQuestionFiles () {
  try {
    await connectDB()

    const dir = await fse.readdir('src/questions')

    dir.forEach(async fileName => {
      const file = (await fse.readFile('src/questions/' + fileName, 'utf-8')).split('\n\n')

      const fname = fileName.replace('.txt', '')
      const Category = await createModel(fname)

      let a1, a2, a3, a4

      for (let index = 0; index < file.length; index++) {
        const file2 = file[index].split('\n')

        if (file2.length === 6) {
          const answerArr = []

          a1 = file2[2].replace('A ', '')
          a2 = file2[3].replace('B ', '')
          a3 = file2[4].replace('C ', '')
          a4 = file2[5].replace('D ', '')

          answerArr.push(a1, a2, a3, a4)

          const newQuestion = {
            question: file2[0].replace('#Q ', ''),
            answers: answerArr,
            correctAnswer: file2[1].replace('^ ', ''),
            category: fname
          }

          await Category?.create(newQuestion)
        }
      }
    })
  } catch (err) {
    console.error(err)
  }
}
parseQuestionFiles()
