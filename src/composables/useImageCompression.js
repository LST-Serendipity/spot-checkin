export async function compressImage(file, options = {}) {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    quality: 0.8
  }

  const config = { ...defaultOptions, ...options }

  if (file.size < config.maxSizeMB * 1024 * 1024 && file.type === config.fileType) {
    return file
  }

  try {
    const imageCompression = (await import('browser-image-compression')).default
    const compressedFile = await imageCompression(file, config)
    return new File([compressedFile], file.name, {
      type: config.fileType,
      lastModified: Date.now()
    })
  } catch (err) {
    console.warn('Image compression failed, using original file:', err)
    return file
  }
}

export async function compressMultipleImages(files, options = {}) {
  const results = []
  for (const file of files) {
    const compressed = await compressImage(file, options)
    results.push(compressed)
  }
  return results
}

export function getImageDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
    }
    img.src = URL.createObjectURL(file)
  })
}

export async function validateAndCompress(file, maxSizeMB = 2) {
  const maxSize = maxSizeMB * 1024 * 1024

  if (file.size <= maxSize) {
    return file
  }

  const compressed = await compressImage(file, {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1920
  })

  return compressed
}
