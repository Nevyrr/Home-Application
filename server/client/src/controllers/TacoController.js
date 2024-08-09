
const getFile = async (filename) => {
  const res = await fetch('/api/taco/image/' + filename, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

const uploadFile = async (selectedFile) => {
  if (!selectedFile) {
    setMessage('Please select a file first');
    return;
  }
  const formData = new FormData();
  formData.append('image', selectedFile);
  const res = await fetch('/api/taco/upload/', formData, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

export { getFile, uploadFile };
