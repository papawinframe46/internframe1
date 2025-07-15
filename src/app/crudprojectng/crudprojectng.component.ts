import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-crudprojectng',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './crudprojectng.component.html',
  styleUrls: ['./crudprojectng.component.css']
})
export class CrudprojectngComponent {
  studentId = '';
  firstName = '';
  lastName = '';
  year = '';
  faculty = '';
  major = '';
  result = '';
  students: any[] = [];
  searchKeyword = '';
  isEditMode = false;
  editId: number | null = null;

  constructor(private http: HttpClient, private messageService: MessageService) {
    this.getStudents();
  }

  // 🔁 ดึงข้อมูลนักศึกษาจาก backend
  getStudents() {
    console.log('Fetching students from backend...');
    this.http.get<any[]>('http://localhost:8080/api/students').subscribe({
      next: (data) => {
        this.students = data;
        this.messageService.add({ severity: 'info', summary: 'โหลดข้อมูล', detail: 'โหลดข้อมูลนักศึกษาสำเร็จ' });
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.result = 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
        this.messageService.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: this.result });
      }
    });
  }

  // ✅ บันทึกหรือแก้ไขข้อมูล
  onSearch() {
    console.log('onSearch called with:', {
      studentId: this.studentId,
      firstName: this.firstName,
      lastName: this.lastName,
      year: this.year,
      faculty: this.faculty,
      major: this.major,
      isEditMode: this.isEditMode,
      editId: this.editId
    });

    if (!this.isFormValid()) {
      this.result = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      this.messageService.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: this.result });
      return;
    }

    const student = {
      studentId: this.studentId,
      firstName: this.firstName,
      lastName: this.lastName,
      year: this.year,
      faculty: this.faculty,
      major: this.major
    };

    if (this.isEditMode && this.editId != null) {
      console.log('Updating student with ID:', this.editId);
      this.http.put(`http://localhost:8080/api/students/${this.editId}`, student).subscribe({
        next: () => {
          this.result = 'แก้ไขข้อมูลสำเร็จ';
          this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: this.result });
          this.getStudents();
          this.onClear();
        },
        error: (err) => {
          console.error('Error updating student:', err);
          this.result = 'เกิดข้อผิดพลาดในการแก้ไข: ' + (err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
          this.messageService.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: this.result });
        }
      });
    } else {
      console.log('Creating new student');
      this.http.post('http://localhost:8080/api/students', student).subscribe({
        next: () => {
          this.result = 'บันทึกข้อมูลสำเร็จ';
          this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: this.result });
          this.getStudents();
          this.onClear();
        },
        error: (err) => {
          console.error('Error saving student:', err);
          this.result = 'เกิดข้อผิดพลาดในการบันทึก: ' + (err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
          this.messageService.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: this.result });
        }
      });
    }
  }

  // ♻️ ล้างฟอร์ม
  onClear() {
    console.log('Clearing form');
    this.studentId = '';
    this.firstName = '';
    this.lastName = '';
    this.year = '';
    this.faculty = '';
    this.major = '';
    this.result = '';
    this.editId = null;
    this.isEditMode = false;
    this.messageService.add({ severity: 'info', summary: 'ล้างข้อมูล', detail: 'ฟอร์มถูกล้างเรียบร้อยแล้ว' });
  }

  // ✏️ แก้ไขข้อมูล
  editStudent(student: any) {
    console.log('Editing student:', student);
    this.studentId = student.studentId;
    this.firstName = student.firstName;
    this.lastName = student.lastName;
    this.year = student.year;
    this.faculty = student.faculty;
    this.major = student.major;
    this.editId = student.id;
    this.isEditMode = true;
    this.result = '';
    this.messageService.add({ severity: 'info', summary: 'แก้ไข', detail: 'พร้อมสำหรับการแก้ไขข้อมูล' });
  }

  // ❌ ลบนักศึกษา
  deleteStudent(student: any) {
    console.log('Deleting student with ID:', student.id);
    this.http.delete(`http://localhost:8080/api/students/${student.id}`).subscribe({
      next: () => {
        this.result = 'ลบข้อมูลสำเร็จ';
        this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: this.result });
        this.getStudents();
      },
      error: (err) => {
        console.error('Error deleting student:', err);
        this.result = 'เกิดข้อผิดพลาดในการลบ: ' + (err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
        this.messageService.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: this.result });
      }
    });
  }

  // 🔢 อนุญาตเฉพาะตัวเลข
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // ✅ ตรวจสอบความถูกต้องของฟอร์ม
  isFormValid(): boolean {
    const isValid = (
      this.studentId.trim() !== '' &&
      /^[0-9]+$/.test(this.studentId) &&
      this.firstName.trim() !== '' &&
      this.lastName.trim() !== '' &&
      this.year.trim() !== '' &&
      /^[0-9]+$/.test(this.year) &&
      this.faculty.trim() !== '' &&
      this.major.trim() !== ''
    );
    console.log('Form validation result:', isValid);
    return isValid;
  }

  // 📤 Export รายชื่อนักศึกษาเป็นไฟล์ Excel
  exportToExcel(): void {
    console.log('Exporting to Excel');
    const data = this.students.map((s) => ({
      'รหัสนักศึกษา': s.studentId,
      'ชื่อ': s.firstName,
      'นามสกุล': s.lastName,
      'ชั้นปี': s.year,
      'คณะ': s.faculty,
      'สาขา': s.major
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'รายชื่อนักศึกษา': worksheet },
      SheetNames: ['รายชื่อนักศึกษา']
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
    this.saveAsExcelFile(excelBuffer, 'student_list');
    this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'ส่งออกไฟล์ Excel เรียบร้อยแล้ว' });
  }

  // 💾 บันทึกไฟล์ .xlsx ลงเครื่อง
  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(data, fileName + '.xlsx');
  }
}