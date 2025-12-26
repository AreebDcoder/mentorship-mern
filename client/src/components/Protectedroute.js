import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    //get user
    const getUser = useCallback(async () => {
        try {
            dispatch(showLoading());
            const res = await axios.post(
                "/api/v1/user/getUserData",
                { token: localStorage.getItem("token") },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                dispatch(setUser(res.data.data));
            } else {
                localStorage.clear();
                setShouldRedirect(true);
            }
        } catch (error) {
            localStorage.clear();
            dispatch(hideLoading());
            setShouldRedirect(true);
            console.log(error);
        }
    }, [dispatch]);

    useEffect(() => {
        if (!user && localStorage.getItem("token")) {
            getUser();
        }
    }, [user, getUser]);

    if (shouldRedirect || !localStorage.getItem("token")) {
        return <Navigate to="/login" />;
    }

    if (!user && localStorage.getItem("token")) {
        return null; // or a loading spinner
    }

    return children;
}