import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, GraduationCap, BookOpen } from "lucide-react";
import { getAllStudents, addStudent, getCurrentStudentId, setCurrentStudentId } from "@/lib/localStorage";
import type { Student } from "@shared/schema";

export function StudentSelectionScreen() {
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    grade: 6,
    section: "A"
  });
  
  const allStudents = getAllStudents();

  const handleSwitchUser = (studentId: string) => {
    setCurrentStudentId(studentId);
    window.location.reload(); // Refresh to load new user's data
  };

  const generateStudentId = (name: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `student-${cleanName}-${Date.now()}`;
  };

  const generateInitials = (name: string) => {
    return name.split(' ').map(word => word[0]?.toUpperCase() || '').join('').slice(0, 2);
  };

  const handleAddStudent = () => {
    if (!newStudentForm.name.trim()) return;
    
    const newStudent: Student = {
      id: generateStudentId(newStudentForm.name),
      name: newStudentForm.name.trim(),
      grade: newStudentForm.grade,
      section: newStudentForm.section,
      initials: generateInitials(newStudentForm.name.trim()),
      createdAt: new Date()
    };
    
    addStudent(newStudent);
    setCurrentStudentId(newStudent.id);
    window.location.reload(); // Refresh to load new user's data
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newStudentForm.name.trim()) {
      handleAddStudent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Math Fact Fluency</h1>
          <p className="text-gray-600 text-lg">
            Welcome! Please select your student profile to continue.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6" />
              Student Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Students */}
            {allStudents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Select Your Profile
                </h3>
                <div className="grid gap-3">
                  {allStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSwitchUser(student.id)}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group"
                      data-testid={`button-select-student-${student.id}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-semibold group-hover:bg-primary-600 transition-colors">
                        {student.initials}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Grade {student.grade}, Section {student.section}
                        </div>
                      </div>
                      <BookOpen className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Student Section */}
            <div className="space-y-4">
              {allStudents.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              )}

              {!showNewStudentForm ? (
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Create New Profile
                  </h3>
                  <Button
                    onClick={() => setShowNewStudentForm(true)}
                    className="w-full sm:w-auto flex items-center gap-2 text-lg py-6 px-8"
                    data-testid="button-create-new-student"
                  >
                    <UserPlus className="h-5 w-5" />
                    Create New Student Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Create Your Profile
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        What's your name?
                      </label>
                      <Input
                        placeholder="Enter your full name"
                        value={newStudentForm.name}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, name: e.target.value }))}
                        onKeyPress={handleKeyPress}
                        className="text-lg py-3"
                        autoFocus
                        data-testid="input-student-name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Grade
                        </label>
                        <Select
                          value={newStudentForm.grade.toString()}
                          onValueChange={(value) => setNewStudentForm(prev => ({ ...prev, grade: parseInt(value) }))}
                        >
                          <SelectTrigger data-testid="select-student-grade">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                              <SelectItem key={grade} value={grade.toString()}>
                                Grade {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Section
                        </label>
                        <Select
                          value={newStudentForm.section}
                          onValueChange={(value) => setNewStudentForm(prev => ({ ...prev, section: value }))}
                        >
                          <SelectTrigger data-testid="select-student-section">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['A', 'B', 'C', 'D', 'E'].map(section => (
                              <SelectItem key={section} value={section}>
                                Section {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleAddStudent}
                      className="flex-1 py-3"
                      disabled={!newStudentForm.name.trim()}
                      data-testid="button-create-profile"
                    >
                      Create My Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewStudentForm(false);
                        setNewStudentForm({ name: "", grade: 6, section: "A" });
                      }}
                      className="flex-1 py-3"
                      data-testid="button-cancel-create"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Bay-Williams & Kling Framework • Math Fact Fluency Practice</p>
        </div>
      </div>
    </div>
  );
}