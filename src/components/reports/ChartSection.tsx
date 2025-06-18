import React from "react"
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/react"
import { Chart } from "chart.js"

interface ChartSectionProps {
  title: string
  figureNumber: number
  description: string
  chartId: string
  renderChart: (chartId: string) => void
  className?: string
}

class ChartSection extends React.Component<ChartSectionProps> {
  chartRef = React.createRef<HTMLCanvasElement>()

  componentDidMount() {
    if (this.chartRef.current) {
      this.props.renderChart(this.props.chartId)
    }
  }

  componentDidUpdate() {
    if (this.chartRef.current) {
      // Destroy existing chart to prevent memory leaks
      const chartInstance = Chart.getChart(this.props.chartId)
      if (chartInstance) {
        chartInstance.destroy()
      }

      this.props.renderChart(this.props.chartId)
    }
  }

  componentWillUnmount() {
    // Clean up chart instance
    const chartInstance = Chart.getChart(this.props.chartId)
    if (chartInstance) {
      chartInstance.destroy()
    }
  }

  render() {
    const { title, figureNumber, description, chartId, className } = this.props

    return (
      <IonCard className={className}>
        <IonCardHeader>
          <IonCardTitle>
            Figure {figureNumber}: {title}
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p className="chart-description">{description}</p>
          <div className="chart-container">
            <canvas id={chartId} ref={this.chartRef}></canvas>
          </div>
        </IonCardContent>
      </IonCard>
    )
  }
}

export default ChartSection
