const fs = require('fs')
const childProcess = require('child_process')
const trim = require('../lib/trim')

describe('trim()', () => {
  it('should trim the whitespace from the bottom of an image', done => {
    // 6x12 black and red stripe with 6x3 white border at the bottom
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAYAAAAPCAIAAABIoSnXAAAAG0lEQVQY02NkgIH/MAYTAwYY2kKM////J0sjAMfuBBlj2/wVAAAAAElFTkSuQmCC', 'base64')

    trim(image).then(trimmed => {
      const TEMP_FILE = 'trim-spec-tmp.png'

      fs.writeFile(TEMP_FILE, trimmed, () => {
        childProcess.exec(`identify ${TEMP_FILE}`, (_, stdout) => {
          expect(stdout.indexOf('6x12')).toBeGreaterThan(-1)

          fs.unlink(TEMP_FILE, done)
        })
      })
    })
  })
})
