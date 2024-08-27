
const getTacoData = async () => {
  const res = await fetch('/api/taco/', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data.taco[0];
};

const updateVermifugeDate = async (date) => {
  const res = await fetch('/api/taco/vermifuge/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ date }),
  })

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

const updateAntiPuceDate = async (date) => {
  const res = await fetch('/api/taco/antipuce/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ date }),
  })

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

const getFile = async (filename) => {
  const res = await fetch('/api/taco/image/' + filename, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

export { getTacoData, getFile, updateVermifugeDate, updateAntiPuceDate, uploadFile };
