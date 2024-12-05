// Importar módulos necesarios de Firebase
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getDatabase, ref as dbRef, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAaEmQApj65zftBpVPBjDz10pJPsjFm_NQ",
  authDomain: "ventas-9f734.firebaseapp.com",
  databaseURL: "https://ventas-9f734-default-rtdb.firebaseio.com",
  projectId: "ventas-9f734",
  storageBucket: "ventas-9f734.appspot.com",
  messagingSenderId: "183579140497",
  appId: "1:183579140497:web:366c8ac9e3253d53f83a30",
  measurementId: "G-3FZ1W9FQT0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDB = getDatabase(app);

// Referencias al DOM
const recipeForm = document.getElementById("recipe-form");
const recipesContainer = document.getElementById("recipes-container");

// Guardar en Local Storage
const saveToLocalStorage = (recipes) => {
  localStorage.setItem("recipes", JSON.stringify(recipes));
};

// Obtener de Local Storage
const getFromLocalStorage = () => {
  const storedRecipes = localStorage.getItem("recipes");
  return storedRecipes ? JSON.parse(storedRecipes) : [];
};

// Renderizar recetas
const renderRecipes = (recipes) => {
  recipesContainer.innerHTML = recipes.length
    ? recipes
        .map(
          (recipe) => `
          <div class="recipe bg-light p-3 mb-3 rounded shadow-sm" data-key="${recipe.key}">
            <h5 class="text-primary">${recipe.title}</h5>
            <p><strong>Descripción:</strong> ${recipe.description}</p>
            <p><strong>Ingredientes:</strong> ${recipe.ingredients}</p>
            <p><strong>Pasos:</strong> ${recipe.steps}</p>
            <p><strong>Tiempo:</strong> ${recipe.time} min</p>
            <p><strong>Dificultad:</strong> ${recipe.difficulty}</p>
            <p><strong>Porciones:</strong> ${recipe.portion}</p>
            <button class="btn btn-danger btn-sm delete-btn" data-key="${recipe.key}">Eliminar</button>
          </div>`
        )
        .join("")
    : `<p class="text-muted">No hay recetas guardadas aún.</p>`;

  // Añadir eventos a los botones de eliminar
  document.querySelectorAll(".delete-btn").forEach((button) =>
    button.addEventListener("click", async (e) => {
      const recipeKey = e.target.getAttribute("data-key");
      await deleteRecipe(recipeKey);
      fetchAndRenderRecipes(); // Actualizar la lista
    })
  );
};

// Función para eliminar una receta
const deleteRecipe = async (key) => {
  try {
    if (navigator.onLine) {
      // Eliminar de Realtime Database si hay conexión
      await remove(dbRef(realtimeDB, `recipes/${key}`));
    }

    // Eliminar de Local Storage
    const recipes = getFromLocalStorage().filter((recipe) => recipe.key !== key);
    saveToLocalStorage(recipes);

    alert("Receta eliminada exitosamente.");
  } catch (error) {
    console.error("Error al eliminar la receta:", error);
  }
};

// Guardar receta
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newRecipe = {
    title: document.getElementById("recipe-title").value,
    description: document.getElementById("recipe-description").value,
    ingredients: document.getElementById("recipe-ingredients").value,
    steps: document.getElementById("recipe-steps").value,
    time: parseInt(document.getElementById("recipe-time").value),
    difficulty: document.getElementById("recipe-difficulty").value,
    portion: parseInt(document.getElementById("recipe-portion").value),
    createdAt: new Date().toISOString(),
  };

  try {
    if (navigator.onLine) {
      // Guardar en Firebase si hay conexión
      const newRecipeRef = push(dbRef(realtimeDB, "recipes"));
      await set(newRecipeRef, newRecipe);

      // Actualizar Local Storage
      const recipes = getFromLocalStorage();
      recipes.push({ key: newRecipeRef.key, ...newRecipe });
      saveToLocalStorage(recipes);

      alert("Receta guardada exitosamente en Firebase.");
    } else {
      // Guardar solo en Local Storage si no hay conexión
      const recipes = getFromLocalStorage();
      recipes.push({ key: `local-${Date.now()}`, ...newRecipe });
      saveToLocalStorage(recipes);

      alert("Receta guardada localmente. Se sincronizará cuando haya conexión.");
    }

    fetchAndRenderRecipes();
    recipeForm.reset();
  } catch (error) {
    console.error("Error al guardar la receta:", error);
  }
});

// Sincronizar recetas locales con Firebase
const syncLocalDataToFirebase = async () => {
  const localRecipes = getFromLocalStorage().filter((recipe) =>
    recipe.key.startsWith("local-")
  );

  for (const recipe of localRecipes) {
    try {
      const newRecipeRef = push(dbRef(realtimeDB, "recipes"));
      await set(newRecipeRef, recipe);

      // Actualizar clave local con la de Firebase
      recipe.key = newRecipeRef.key;

      saveToLocalStorage(getFromLocalStorage());
    } catch (error) {
      console.error("Error al sincronizar receta:", recipe, error);
    }
  }
};

// Obtener recetas y manejar estados offline
const fetchAndRenderRecipes = async () => {
  try {
    if (navigator.onLine) {
      // Sincronizar datos locales primero
      await syncLocalDataToFirebase();

      // Obtener recetas de Firebase si hay conexión
      const recipes = [];
      const snapshot = await new Promise((resolve) =>
        onValue(dbRef(realtimeDB, "recipes"), resolve, { onlyOnce: true })
      );

      snapshot.forEach((childSnapshot) => {
        recipes.push({ key: childSnapshot.key, ...childSnapshot.val() });
      });

      // Sincronizar con Local Storage
      saveToLocalStorage(recipes);
      renderRecipes(recipes);
    } else {
      // Cargar datos locales si no hay conexión
      const localRecipes = getFromLocalStorage();
      renderRecipes(localRecipes);
    }
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    renderRecipes(getFromLocalStorage()); // Usar datos locales como respaldo
  }
};

// Escuchar cambios de conexión
window.addEventListener("online", async () => {
  alert("Conexión restaurada. Sincronizando datos...");
  await syncLocalDataToFirebase();
  fetchAndRenderRecipes();
});

window.addEventListener("offline", () => {
  alert("Sin conexión. Mostrando datos guardados localmente.");
  renderRecipes(getFromLocalStorage());
});

// Inicializar renderizado
document.addEventListener("DOMContentLoaded", fetchAndRenderRecipes);
