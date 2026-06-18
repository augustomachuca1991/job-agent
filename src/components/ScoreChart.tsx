import { useEffect, useRef } from "react";
import type { Application } from "../types";
import {
    Chart,
    LineElement, PointElement, LineController,
    CategoryScale, LinearScale,
    Filler, Tooltip,
    type ChartOptions,
} from "chart.js";

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip);

interface Props {
    apps: Application[];
    isMobile: boolean;
}

export default function ScoreChart({ apps, isMobile }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current || apps.length === 0) return;

        const sorted = [...apps].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
        const labels = sorted.map(j => j.company.split(" ")[0]);
        const scores = sorted.map(j => j.score ?? 0);
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

        if (chartRef.current) chartRef.current.destroy();

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const gradLine = ctx.createLinearGradient(0, 0, canvasRef.current.offsetWidth, 0);
        gradLine.addColorStop(0, "#a855f7");
        gradLine.addColorStop(0.5, "#e0176a");
        gradLine.addColorStop(1, "#ff6b2b");

        const gradFill = ctx.createLinearGradient(0, 0, 0, 90);
        gradFill.addColorStop(0, "rgba(224,23,106,0.4)");
        gradFill.addColorStop(0.5, "rgba(255,107,43,0.18)");
        gradFill.addColorStop(1, "rgba(124,58,237,0.0)");

        const options: ChartOptions<"line"> = {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(13,7,16,.95)",
                    titleFont: { family: "DM Mono", size: 10 },
                    bodyFont: { family: "Outfit", size: 11 },
                    borderColor: "rgba(224,23,106,.25)",
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8,
                },
            },
            scales: {
                x: {
                    grid: { color: "rgba(255,255,255,.03)" },
                    ticks: { color: "#5a4566", font: { family: "DM Mono", size: isMobile ? 6 : 8 }, maxRotation: isMobile ? 45 : 0 },
                },
                y: {
                    grid: { color: "rgba(255,255,255,.03)" },
                    ticks: { color: "#5a4566", font: { family: "DM Mono", size: isMobile ? 7 : 8 } },
                    min: 40, max: 100,
                },
            },
        };

        chartRef.current = new Chart(canvasRef.current, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Score",
                        data: scores,
                        fill: true,
                        tension: 0.45,
                        pointRadius: isMobile ? 2 : 3,
                        pointHoverRadius: isMobile ? 4 : 5,
                        pointBackgroundColor: scores.map(s => s >= 85 ? "#ff6b2b" : s >= 70 ? "#e0176a" : "#7c3aed"),
                        pointBorderColor: "transparent",
                        borderColor: gradLine,
                        borderWidth: 2,
                        backgroundColor: gradFill,
                    },
                    {
                        label: "Promedio",
                        data: scores.map(() => avg),
                        fill: false,
                        tension: 0,
                        pointRadius: 0,
                        borderColor: "rgba(255,255,255,.12)",
                        borderWidth: 1.5,
                        borderDash: [5, 4],
                    },
                ],
            },
            options,
        });

        return () => { chartRef.current?.destroy(); };
    }, [apps, isMobile]);

    return <canvas ref={canvasRef} height={isMobile ? 60 : 80} />;
}
