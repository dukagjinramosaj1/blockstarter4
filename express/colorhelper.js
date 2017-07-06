function colorize(data) {
  if (data.address) {
    data.coloredAddress = getColors(data.address)
  }
  if (data.owner) {
    data.coloredOwner = getColors(data.owner)
  }
  if (!data.forEach) return data
  data.forEach(el => {
    if (el.address) {
      el.coloredAddress = getColors(el.address)
    }
    if (el.owner) {
      el.coloredOwner = getColors(el.owner)
    }
  })
  return data
}

function getColors(inputAddress) {
  const address = inputAddress.substring(inputAddress.indexOf('x') + 1)
  let i = 0
  let colors = {}
  let lastNumbers = [0,0]
  while (i < address.length) {
    const color = address.substring(i, i+6)
    colors[`x${i/6}`] = `#${color}`

    // calculate last two positions
    const chars = color.split('')
    for (let j = 0; j < chars.length; j++) {
      lastNumbers[j % 2] = lastNumbers[j % 2] + parseInt(chars[j], 16)
    }

    i = i + 6
  }
  // only one digit
  lastNumbers[0] = lastNumbers[0] % 16
  lastNumbers[1] = lastNumbers[1] % 16
  // concatenate the last two numbers and hex it back
  colors[`x${i/6 - 1}`] = colors[`x${i/6 - 1}`] 
    + lastNumbers[0].toString(16) + lastNumbers[1].toString(16)

  return colors
}

module.exports = colorize
