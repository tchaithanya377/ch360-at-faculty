// firebaseQueries.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const fetchLinkedStudents = async (facultyId, course, section) => {
  const collectionRef = collection(db, "noDues", course, section);

  const q = query(
    collectionRef,
    where("courses_faculty.facultyId", "==", facultyId)
  );

  try {
    const querySnapshot = await getDocs(q);
    const students = [];
    querySnapshot.forEach((doc) => {
      students.push(doc.data());
    });
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};
