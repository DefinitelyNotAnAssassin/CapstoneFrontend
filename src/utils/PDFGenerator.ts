import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import sdcaLogo from "../../public/sdca-logo.png"

interface PDFGenerationOptions {
  title: string
  content: HTMLElement | null
  orientation: "portrait" | "landscape"
  startDate: string
  endDate: string
  department: string
}

// Function to add header and footer to PDF page
const addHeaderAndFooter = (
  pdf: jsPDF,
  pageNumber: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  title: string,
) => {
  // Add header
  pdf.setFillColor(255, 255, 255) // White header
  pdf.rect(0, 0, pageWidth, 25, "F")

  try {
    // Add the logo image to the header (left side)
    pdf.addImage(sdcaLogo, "PNG", 10, 2, 20, 20)
  } catch (error) {
    console.error("Error adding logo to PDF:", error)
  }

  // Add title to header (center)
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)
  pdf.text(title, pageWidth / 2, 15, { align: "center" })

  // Add page number at the bottom
  pdf.setFontSize(10)
  pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 40, pageHeight - 10)

  // Add footer
  pdf.setDrawColor(200, 200, 200)
  pdf.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20)
  pdf.setFontSize(8)
  pdf.text("Human Resource Information Management System", 10, pageHeight - 15)
  pdf.text("Confidential - For internal use only", 10, pageHeight - 10)
}

export const generatePDF = async (options: PDFGenerationOptions): Promise<void> => {
  const { title, content, orientation, startDate, endDate, department } = options

  if (!content) {
    throw new Error("Content element not found")
  }

  try {
    // Create PDF with selected orientation
    const pdf = new jsPDF(orientation, "mm", "a4")

    // Set PDF metadata
    pdf.setProperties({
      title: title,
      subject: "Human Resource Information Management System Report",
      author: "HRIMS System",
      keywords: "HRIMS, HR, Report",
      creator: "HRIMS PDF Export",
    })

    // Calculate dimensions
    const pageWidth = orientation === "landscape" ? 297 : 210
    const pageHeight = orientation === "landscape" ? 210 : 297
    const margin = 10
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2 - 30 // Account for header and footer

    // Add first page with title and filters
    const totalPages = 1 // For now, just one page
    addHeaderAndFooter(pdf, 1, totalPages, pageWidth, pageHeight, title)

    // Add date and filters
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.text("Report Information", margin, 35)

    pdf.setFontSize(10)
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, 45)
    pdf.text(`Department: ${department}`, margin, 50)
    pdf.text(`Date Range: ${startDate} to ${endDate}`, margin, 55)

    // Capture the content
    const canvas = await html2canvas(content, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/jpeg", 0.9)

    // Calculate image dimensions to fit the page
    const imgWidth = usableWidth
    const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, usableHeight - 60) // Leave space for header info

    // Add content image
    pdf.addImage(imgData, "JPEG", margin, 65, imgWidth, imgHeight)

    // Save PDF
    pdf.save(`HRIMS_${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`)

    return Promise.resolve()
  } catch (error) {
    console.error("Error exporting PDF:", error)
    throw error
  }
}
