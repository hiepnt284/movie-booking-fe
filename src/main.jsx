import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.jsx";
import Home from "./pages/Home.jsx";
import Cinema from "./pages/Cinema.jsx";
import Sale from "./pages/Sale.jsx";
import AuthOauth from "./pages/AuthOauth.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import AppAdmin from "./AppAdmin.jsx";
import HomeAdmin from "./pages/HomeAdmin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ManageMovie from "./pages/ManageMovie.jsx";
import ManageTheater from "./pages/ManageTheater.jsx";
import ManageShowing from "./pages/ManageShowing.jsx";
import ShowTimeDetail from "./pages/ShowTimeDetail.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: "true",
        element: <Home />,
      },
      {
        path: "cinema",
        element: <Cinema />,
      },
      {
        path: "sale",
        element: <Sale />,
      },
      {
        path: "movie/:movieId",
        element: <MovieDetail />,
      },
      {
        path: "showtime/:showtimeId",
        element: (
          <ProtectedRoute>
            <ShowTimeDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment-success",
        element: (
          <PaymentSuccess/>
        ),
      },
    ],
  },
  {
    path: "/authenticate/oauth",
    element: <AuthOauth />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AppAdmin />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomeAdmin />,
      },
      {
        path: "manage-movie",
        element: <ManageMovie />,
      },
      {
        path: "manage-theater",
        element: <ManageTheater />,
      },
      {
        path: "manage-showing",
        element: <ManageShowing />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
  // </StrictMode>
);
