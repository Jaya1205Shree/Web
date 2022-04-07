const express = require("express");
const db = require("./db");
const router = express();

var user = [];
var name = '';
var doc=[];

router.get('/', (req, res) => {
    res.render('index.ejs');
});

router.get('/contact', (req, res) => {
    res.render('contact');
});


router.post("/contact", (req, res) => {
    const { fullname, emailid, mobileno, description } = req.body;
    db.query('INSERT INTO tblcontactus SET ?', {
        fullname: fullname,
        email: emailid,
        contactno: mobileno,
        message: description
    }, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.log(results);
            return res.render('contact');
        }
    })
});


router.get('/registration', (req, res) => {
    res.render('registration',  { message:'', check: 0 });
});

router.post("/registration", (req, res) => {
    const { full_name, address, city, gender, email, password, password_again } = req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log(err);
        }

        if (results.length > 0) {
            return res.render('registration.ejs', {
                check: 0,
                message: "Email already exist"
            });
        } else if (password !== password_again) {
            return res.render('registration.ejs', {
                check: 0,
                message: "Passwords do not match"
            });
        }
        db.query('INSERT INTO users SET ?', {
            fullName: full_name,
            address: address,
            city: city,
            gender: gender,
            email: email,
            password: password
        }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                return res.render('registration.ejs', {
                    check: 1,
                    message: "User registered "
                });
            }
        })
    })
});

router.get('/userLogin', (req, res) => {
    res.render('userLogin', { message:'' });
});

router.post("/userLogin", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).render('userLogin.ejs', {
                message: "Please provide an email and password"
            })
        }
        db.query('SELECT * FROM users WHERE email = ?', [username], async (error, results) => {
            if (!results.length || password !== results[0].password) {
                res.status(401).render('userLogin.ejs', {
                    message: "Email or Password is incorrect"
                })
            } else {
                user.push(results[0]);
                name = user[0].fullName;
                res.status(200).render('dashboard.ejs',{ name: name });
            }
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs',{ name: name })
});

router.get('/editProfile', (req, res) => {
    res.render('editProfile', {
        id: user[0].id,
        fullName: user[0].fullName,
        address: user[0].address,
        city: user[0].city,
        gender: user[0].gender,
        email: user[0].email,
        message: '',
        name:name
    });
});

router.post('/editProfile/:id', (req, res) => {
    const { fullName, address, city, gender} = req.body;
    let sql = 'UPDATE users SET fullName = ?, address = ?, city = ?, gender = ? WHERE id = ?';
    db.query(sql, [
        fullName,
        address,
        city,
        gender,
        req.params.id
    ], (err, result) => {
        if (err) {
            res.render('editProfile.ejs', {
                id: user[0].id,
                fullName: user[0].fullName,
                address: user[0].address,
                city: user[0].city,
                gender: user[0].gender,
                email: user[0].email,
                message: "Unable to process your request, try later",
                name:name
            })
        } else {
            user[0].fullName = fullName;
            user[0].address = address;
            user[0].city = city;
            user[0].gender = gender;
            res.render('dashboard.ejs',{ name: name })
        }
    });
});

router.get('/changePassword', (req, res) => {
    res.render('changePassword.ejs',{ name: name, message: '' })
});

router.post("/changePassword", (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    db.query('SELECT password FROM users WHERE email = ?', user[0].email, (err, results) => {
        if (err) {
            console.log(err);
        }
    if (currentPassword !== results[0].password) {
            return res.render('changePassword.ejs', {
                message: "Old passwords does not match",
                name: name
            });
        }else if(newPassword !== confirmPassword){
            return res.render('changePassword.ejs', {
                message: "new password and confirm password does not match",
                name: name
            });
        }
        db.query('update users SET password = ? where email = ?', [newPassword, user[0].email], (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                return res.render('dashboard.ejs', { name: name });
            }
        })
    })
});

router.get('/logout', (req, res) => {
    user = [];
    name = '';
    res.redirect('/');
});

router.get('/bookAppointment', (req, res) => {
    db.query('SELECT specilization FROM doctorspecilization', (err, result_1) => {
        if(err){
            throw err;
        } else {
            db.query('SELECT doctorName,id,docFees FROM doctors', (err, result_2) => {
                if(err){
                    throw err;
                } else {
                    // doc.push(result_2[0]);
                    // docId = result_2[0].id;
                    obj = {message_1: result_1,message_2: result_2, name:name};
                    res.render('bookAppointment', obj);                
                }
            })              
        }
    })
});

router.post("/bookAppointment", (req, res) => {
    const { Doctorspecialization, doctor, fees,appdate,apptime } = req.body;
    db.query('SELECT doctorName,id,docFees FROM doctors where doctorName = ?',doctor , (err, result_2) => {
        if(err){
            throw err;
        } else {
            doc.push(result_2[0]); 
            db.query('INSERT INTO appointment SET ?', {
                doctorspecialization:Doctorspecialization ,
                 doctorId: doc[0].id,
                 userId: user[0].id,
                 consultancyFees: doc[0].docFees,
                 appointmentDate:appdate,
                  appointmentTime:apptime,
                  userStatus:1,
                  doctorStatus:1
            }, (err, results) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(results);
                    return res.render('dashboard.ejs', {name:name});
                }
            })           
        }
    })  
    
});

router.get('/appointmentHistory', (req, res) => {
    db.query('select * from appointment join doctors on doctors.id=appointment.doctorId where appointment.userId = ?', user[0].id, (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {message: results, name: name};
            // console.log(obj)
            res.render('appointmentHistory', obj)            
        }
    })
});

router.post('/cancelAppointment/:id', (req, res) => {
    db.query('update appointment SET userStatus = ? WHERE (doctorId = ? and userId = ?)', [
        0,
        req.params.id,
        user[0].id
    ], (err, result) => {
        if(err){
            throw err;
        }
            res.render('dashboard.ejs',{ name: name })
    });
});


router.get('/manageMedHistory', (req, res) => {
    db.query('select tblpatient.* from tblpatient join users on users.email=tblpatient.PatientEmail where users.fullName = ?', user[0].fullName, (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {message: results, name: name};
            res.render('manageMedHistory', obj)            
        }
    })
});

router.get('/viewMedHistory/:name', (req, res) => {
    db.query('select * from tblpatient where PatientName = ?', req.params.name, (err, results) => {
        if(err){
            throw err;
        } else {
            db.query('select * from tblmedicalhistory  where PatientID= ?', user[0].id, (err, results_1) => {
                if(err){
                    throw err;
                } else {
                    obj = {
                        message: results_1,
                        name: name,
                        PatientName: results[0].PatientName,
                        PatientContno: results[0].PatientContno, 
                        PatientEmail: results[0].PatientEmail, 
                        PatientGender: results[0].PatientGender, 
                        PatientAdd: results[0].PatientAdd, 
                        PatientAge: results[0].PatientAge,
                        PatientMedhis: results[0].PatientMedhis,
                        CreationDate: results[0].CreationDate
                    }
                    res.render('viewMedHistory', obj)            
                }
            })            
        }
    })
});

router.get('/doctorLogin', (req, res) => {
    res.render('doctorLogin', { message:'' });
});

router.post("/doctorLogin", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).render('doctorLogin.ejs', {
                message: "Please provide an email and password"
            })
        }
        db.query('SELECT * FROM doctors WHERE docEmail = ?', username, async (error, results) => {
            if (!results.length || password !== results[0].password) {
                res.status(401).render('doctorLogin.ejs', {
                    message: "Email or Password is incorrect"
                })
            } else {
                user.push(results[0]);
                name = user[0].doctorName;
                res.status(200).render('doctorDashboard.ejs',{ name: name });
            }
        })
    } catch (error) {
        console.log(error);
    }
});


router.get('/doctorEditProfile', (req, res) => {
    db.query('SELECT * FROM doctorspecilization', (err, result) => {
        if(err){
            throw err;
        } else {
            obj = {message_1: result,
                 name:name, 
                 id: user[0].id,
                specilization: user[0].specilization,
                address: user[0].address,
                docFees: user[0].docFees,
                contactno: user[0].contactno,
                docEmail: user[0].docEmail,
                message: ''};
            res.render('doctorEditProfile', obj);                
        }
    }) 
});

router.post('/doctorEditProfile/:id', (req, res) => {
    const { Doctorspecialization, docname, clinicaddress, docfees, doccontact} = req.body;
    let sql = 'UPDATE doctors SET specilization = ?, doctorName = ?, address = ?, docFees = ?, contactno = ? WHERE id = ?';
    db.query(sql, [
        Doctorspecialization,
        docname,
        clinicaddress,
        docfees,
        doccontact,
        req.params.id
    ], (err, result) => {
       
            user[0].specilization = Doctorspecialization;
            user[0].doctorName = docname;
            user[0].address = clinicaddress;
            user[0].docFees = docfees;
            user[0].contactno = doccontact;
            name= docname;
            res.render('dashboard.ejs',{ name: name })
    });
});

router.get('/doctorDashboard', (req, res) => {
    res.render('doctorDashboard.ejs',{ name: name })
});

router.get('/doctorChangePassword', (req, res) => {
    res.render('doctorChangePassword.ejs',{ name: name, message: '' })
});

router.post("/doctorChangePassword", (req, res) => {
    const { cpass, npass, cfpass } = req.body;
    db.query('SELECT * FROM doctors WHERE docEmail = ?', user[0].docEmail, (err, results) => {
        if (err) {
            console.log(err);
        }
    if (cpass !== results[0].password) {
            return res.render('doctorChangePassword.ejs', {
                message: "Old passwords does not match",
                name: name
            });
        }else if(npass !== cfpass){
            return res.render('doctorChangePassword.ejs', {
                message: "new password and confirm password does not match",
                name: name
            });
        }
        db.query('update doctors SET password = ? where docEmail = ?', [npass, user[0].docEmail], (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                return res.render('doctorDashboard.ejs', { name: name });
            }
        })
    })
});

router.get('/doctorAppointmentHistory', (req, res) => {
    db.query('select * from appointment join users on users.id=appointment.userId where appointment.doctorId = ?', user[0].id, (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {message: results, name: name};
            // console.log(obj)
            res.render('doctorAppointmentHistory', obj)            
        }
    })
});

router.post('/doctorCancelAppointment/:id', (req, res) => {
    db.query('update appointment SET doctorStatus = ? WHERE (doctorId = ? and userId = ?)', [
        0,
        user[0].id,
        req.params.id
    ], (err, result) => {
        if(err){
            throw err;
        }
            res.render('doctorDashboard.ejs',{ name: name })
    });
});

router.get('/doctorAddPatient', (req, res) => {
    res.render('doctorAddPatient',{name:name})  
});

router.post("/doctorAddPatient", (req, res) => {
    const { patname, patcontact, patemail, gender, pataddress, patage, medhis } = req.body;
    db.query('insert into tblpatient set Docid=?,PatientName=?,PatientContno=?,PatientEmail=?,PatientGender=?,PatientAdd=?,PatientAge=?,PatientMedhis=?', [
        user[0].id, patname,patcontact,patemail,gender,pataddress,patage,medhis        
    ], (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.log(results);
            return res.render('doctorDashboard.ejs', {name:name});
        }
    })
});

router.get('/adminLogin', (req, res) => {
    res.render('adminLogin', { message:'' })  
});

router.post("/adminLogin", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).render('adminLogin.ejs', {
                message: "Please provide an email and password"
            })
        }
        db.query('SELECT * FROM admin WHERE username = ?', username, async (error, results) => {
         
            if (!results.length || password !== results[0].password) {
                res.status(401).render('adminLogin.ejs', {
                    message: "Email or Password is incorrect"
                })
            } else {
                user.push(results[0]);
                name = user[0].username;
                res.status(200).render('adminDashboard.ejs',{ name: name });
            }
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/adminDashboard', (req, res) => {
    res.render('adminDashboard.ejs',{ name: name })
});


router.get('/adminChangePassword', (req, res) => {
    res.render('adminChangePassword.ejs',{ name: name, message: '' })
});

router.post("/adminChangePassword", (req, res) => {
    const { cpass, npass, cfpass } = req.body;
    db.query('SELECT password FROM admin WHERE username = ?', user[0].username, (err, results) => {
        if (err) {
            console.log(err);
        }
    if (cpass !== results[0].password) {
            return res.render('adminChangePassword.ejs', {
                message: "Old passwords does not match",
                name: name
            });
        }else if(npass !== cfpass){
            return res.render('adminChangePassword.ejs', {
                message: "new password and confirm password does not match",
                name: name
            });
        }
        db.query('update admin SET password = ? where username = ?', [npass, user[0].username], (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                return res.render('adminDashboard.ejs', { name: name });
            }
        })
    })
});

router.get('/adminManageUsers', (req, res) => {
    db.query('SELECT * FROM users', (err, result_1) => {
        if(err){
            throw err;
        } else {
                    obj = {message: result_1, name:name};
                    res.render('adminManageUsers', obj);                              
        }
    })
});

router.get("/adminDeleteUser/:id", (req, res) => {
    db.query('delete from users where id = ?',req.params.id , (err, result) => {
        if(err){
            throw err;
        } else {
                    return res.render('adminDashboard.ejs', {name:name});
        }
    })  
    
});

router.get('/adminManagedoctors', (req, res) => {
    db.query('SELECT * FROM doctors', (err, result_1) => {
        if(err){
            throw err;
        } else {
                    obj = {message: result_1, name:name};
                    res.render('adminManageDoctors', obj);                              
        }
    })
});

router.get("/adminDeleteDoctor/:id", (req, res) => {
    db.query('delete from doctors where id = ?',req.params.id , (err, result) => {
        if(err){
            throw err;
        } else {
                    return res.render('adminDashboard.ejs', {name:name});
        }
    })  
    
});

router.get('/adminEditDoctor/:id', (req, res) => {
    db.query('SELECT * FROM doctorspecilization', (err, result_1) => {
        if(err){
            throw err;
        } else {
            db.query('SELECT * FROM doctors where id = ?',req.params.id, (err, result_2) => {
                if(err){
                    throw err;
                } else {
                    obj = {message_1: result_1,
                        name:result_2[0].doctorName, 
                        id: result_2[0].id,
                        specilization: result_2[0].specilization,
                        address: result_2[0].address,
                        docFees: result_2[0].docFees,
                        contactno: result_2[0].contactno,
                        docEmail: result_2[0].docEmail,
                        message: ''};
                        res.render('adminEditDoctor', obj);                               
                    }
                })
                
            }
        }) 
    });
    
    router.post('/adminEditDoctor', (req, res) => {
        const { Doctorspecialization, docname, clinicaddress, docfees, doccontact,docemail} = req.body;
        let sql = 'UPDATE doctors SET specilization = ?, doctorName = ?, address = ?, docFees = ?, contactno = ? WHERE docEmail = ?';
        db.query(sql, [
            Doctorspecialization,
            docname,
            clinicaddress,
            docfees,
            doccontact,
            docemail
        ], (err, result) => {
            
            res.render('adminDashboard.ejs',{ name: name })
        });
});

router.get('/adminAppointmentHistory', (req, res) => {
    db.query('select * from appointment join doctors on doctors.id=appointment.doctorId join users on users.id=appointment.userId', (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {message: results, name: name};
            // console.log(obj)
            res.render('adminAppointmentHistory', obj)            
        }
    })
});

router.get('/adminManagePatient', (req, res) => {
    db.query('select * from tblpatient', (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {message: results, name: name};
            // console.log(obj)
            res.render('adminManagePatients', obj)            
        }
    })
});

router.get('/adminViewPatient/:name', (req, res) => {
    db.query('select * from tblpatient where PatientName = ?', req.params.name, (err, results) => {
        if(err){
            throw err;
        } else {
            db.query('select * from tblmedicalhistory  where PatientID= ?', user[0].id, (err, results_1) => {
                if(err){
                    throw err;
                } else {
                    obj = {
                        message: results_1,
                        name: name,
                        PatientName: results[0].PatientName,
                        PatientContno: results[0].PatientContno, 
                        PatientEmail: results[0].PatientEmail, 
                        PatientGender: results[0].PatientGender, 
                        PatientAdd: results[0].PatientAdd, 
                        PatientAge: results[0].PatientAge,
                        PatientMedhis: results[0].PatientMedhis,
                        CreationDate: results[0].CreationDate
                    }
                    res.render('adminViewPatient', obj)            
                }
            })            
        }
    })
});

router.get('/adminQuery', (req, res) => {
    db.query('select * from tblcontactus', (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {
                message: results,
                name: name
            }
            res.render('adminQuery', obj)                       
        }
    })
});

router.get('/adminDoctorSpecilization', (req, res) => {
    db.query('select * from doctorSpecilization', (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {message: results, name: name};
            // console.log(obj)
            res.render('adminDoctorSpecilization', obj)            
        }
    })
});

router.post('/adminAddSpecilization', (req, res) => {
    const { doctorspecilization} = req.body;
    db.query('insert into doctorSpecilization set specilization = ?', doctorspecilization, (err, result) => {
        
        res.render('adminDashboard.ejs',{ name: name })
    });
});

router.get('/editDoctorSpecialization/:id', (req, res) => {
    db.query('select * from doctorSpecilization where id=?',req.params.id, (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {specilization: results[0].specilization,id:results[0].id, name: name};
            // console.log(obj)
            res.render('editDoctorSpecialization', obj)            
        }
    })
});

router.post('/editDoctorSpecialization/:id', (req, res) => {
    const { doctorspecilization} = req.body;
    db.query('update doctorSpecilization set specilization = ? where id = ?', [doctorspecilization, req.params.id], (err, result) => {
       
            res.render('adminDashboard.ejs',{ name: name })
    });
});

router.get("/deleteDoctorSpecilization/:id", (req, res) => {
    db.query('delete from doctorSpecilization where id = ?',req.params.id , (err, result) => {
        if(err){
            throw err;
        } else {
                    return res.render('adminDashboard.ejs', {name:name});
        }
    })  
    
});

router.get("/adminAddDoctor", (req, res) => {
    db.query('select * from doctorspecilization', (err, results) => {
        if(err){
            throw err;
        } else {
            obj = {message:"" ,message_1:results, name: name, check:""};
            res.render('adminAddDoctor', obj)            
        }
    })
});

router.post('/adminAddDoctor', (req, res) => {
    const { Doctorspecialization, docname, clinicaddress, docfees, doccontact, docemail, npass, cfpass} = req.body;

    db.query('SELECT * FROM doctors WHERE docEmail = ?', [docemail], (err, results) => {
        if (err) {
            console.log(err);
        }
        db.query('select * from doctorspecilization', (err, results_1) => {
            if(err){
                throw err;
            } else {
        if (results.length > 0) {
            return res.render('adminAddDoctor.ejs', {
                check: 0,
                message: "Email already exist",
                message_1:results_1,
                name:name
            });
        } else if (npass !== cfpass) {
            return res.render('adminAddDoctor.ejs', {
                check: 0,
                message: "Passwords do not match",
                message_1:results_1,
                name:name
            });
        }
        db.query('INSERT INTO doctors SET ?', {
            specilization : Doctorspecialization,
            doctorName : docname,
            address : clinicaddress,
            docFees : docfees,
            contactno : doccontact,
            docEmail: docemail,
            password:npass
        }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                return res.render('adminAddDoctor.ejs', {
                    check: 1,
                    message: "Doctor registered ",
                    message_1:results_1,
                    name:name
                });
            }
        })         
            }
        })
    })
});

module.exports = router;
