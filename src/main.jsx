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
import ManageFood from "./pages/ManageFood.jsx";
import PaymentFail from "./pages/PaymentFail.jsx";
import ScanQR from "./pages/ScanQR.jsx";
import UserPage from "./pages/UserPage.jsx";
import CinemaDetail from "./pages/CinemaDetail.jsx";
import Movie from "./pages/Movie.jsx";
import ManageCarousel from "./pages/ManageCarousel.jsx";
import ManagePost from "./pages/ManagePost.jsx";
import SaleDetail from "./pages/SaleDetail.jsx";
import ManageTicketPrice from "./pages/ManageTicketPrice.jsx";
import ManageStaff from "./pages/ManageStaff.jsx";
import ManageUser from "./pages/ManageUser.jsx";
import BookingTicketOffline from "./pages/BookingTicketOffline.jsx";

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
        path: "cinema/:cinemaId",
        element: <CinemaDetail />,
      },
      {
        path: "sale",
        element: <Sale />,
      },
      {
        path: "sale/:saleId",
        element: <SaleDetail />,
      },
      {
        path: "movie",
        element: <Movie />,
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
        path: "payment-success/:bookingId",
        element: (
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment-fail",
        element: (
          <ProtectedRoute>
            <PaymentFail />
          </ProtectedRoute>
        ),
      },
      {
        path: "user",
        element: (
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
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
      <ProtectedRoute requiredRole={["ADMIN", "MANAGER", "STAFF"]}>
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
      {
        path: "manage-food",
        element: <ManageFood />,
      },
      {
        path: "manage-carousel",
        element: <ManageCarousel />,
      },
      {
        path: "manage-post",
        element: <ManagePost />,
      },
      {
        path: "scan-qr",
        element: <ScanQR />,
      },
      {
        path: "manage-ticket-price",
        element: <ManageTicketPrice />,
      },
      {
        path: "manage-staff",
        element: <ManageStaff />,
      },
      {
        path: "manage-user",
        element: <ManageUser />,
      },
      {
        path: "booking",
        element: <BookingTicketOffline />,
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
