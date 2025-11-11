import React from "react";
import CardBasic from "../components/CardBasic/CardBasic";
import Card from "../components/Card/Card";
import { CiCalendar } from "react-icons/ci";
import { MdCurrencyRupee } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { LuBox } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";
import RecentActivity from "../components/RecentActivity/RecentActivity";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
// import "bootstrap/dist/css/bootstrap.min.css";

const data = [
    {
        name: "Jan",
        revenue: 45000,
        expenses: 30000,
        profit: 15000
    }, {
        name: "Feb",
        revenue: 52000,
        expenses: 35000,
        profit: 17000
    }, {
        name: "Mar",
        revenue: 38000,
        expenses: 22000,
        profit: 16000
    }, {
        name: "Apr",
        revenue: 40000,
        expenses: 25000,
        profit: 15000
    }, {
        name: "May",
        revenue: 57000,
        expenses: 20000,
        profit: 37000
    }, {
        name: "Jun",
        revenue: 68000,
        expenses: 40000,
        profit: 28000
    }, {
        name: "July",
        revenue: 74800,
        expenses: 50400,
        profit: 78000
    }, {
        name: "Aug",
        revenue: 76400,
        expenses: 57800,
        profit: 87600
    }, {
        name: "Sep",
        revenue: 76450,
        expenses: 43940,
        profit: 17600
    }, {
        name: "Oct",
        revenue: 38760,
        expenses: 40000,
        profit: 68750
    }, {
        name: "Nov",
        revenue: 37540,
        expenses: 20000,
        profit: 58643
    }, {
        name: "Dec",
        revenue: 98650,
        expenses: 87600,
        profit: 75640
    }
];

const Dashboard = () => {
    return (
        <div className="overviewContainer container">
            <div className="py-4">
                <h2 className="fs-4 fw-500">Quick Actions</h2>
                <div className="row g-3 justify-content-center pb-4">
                    <CardBasic
                        cardTitle={"New Order"}
                        cardText={" Make a new order"}
                        cardColor={"#B7E4C7"}
                        navigateTo="/takeorders" />
                    <CardBasic
                        cardTitle={"Menu"}
                        cardText={"view full menu"}
                        cardColor={"#A3CCDA"}
                        navigateTo="/takeorders" />
                    <CardBasic
                        cardTitle={"Stock update"}
                        cardText={"Update inventory levels"}
                        cardColor={"#FFF3B0"}
                        navigateTo="/stocks" />

                </div>

                <div className="row  g-3 justify-content-center pb-4">
                    <h2 className="fs-4 fw-500">Overview</h2>
                    <Card
                        cardTitle={"Total Orders"}
                        cardIcon={<IoFastFoodOutline fontSize={
                            20
                        }
                            color="#000000" />}
                        cardSubtitle={"24"}
                        cardTextNum={"+12%"}
                        cardText={" from last month"} />
                    <Card
                        cardTitle={"Monthly Revenue"}
                        cardIcon={< MdCurrencyRupee fontSize={
                            20
                        }
                            color="#000000" />}
                        cardSubtitle={"Rs. 45,231"}
                        cardTextNum={"+8.2%"}
                        cardText={" from last month"} />
                    <Card
                        cardTitle={"Total Staff"}
                        cardIcon={< GoPeople fontSize={
                            20
                        }
                            color="#000000" />}
                        cardSubtitle={"12"}
                        cardTextNum={"+2%"}
                        cardText={" from last month"} />
                    <Card
                        cardTitle={"Stock Status"}
                        cardIcon={< LuBox fontSize={
                            20
                        }
                            color="#000000" />}
                        cardSubtitle={"89%"}
                        cardTextNum={"-3%"}
                        cardText={" from last month"}
                        cardLoss={true} />
                </div>
                <div className="py-4">
                    <h2 className="fs-4 fw-500">Recent Activity</h2>
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;