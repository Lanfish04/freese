const profileService = require("../service/profileService");
const prisma = require("../config/prisma");
const bucket = require('../config/storage');



async function getOtherProfile(req, res, next) {
    try {
        const {id} = req.params;
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }

        const profile = await profileService.getProfileById(id);
        res.status(200).json({
            message: "Berhasil menampilkan profile",
            profile});
    } catch (error) {
        next(error);
    }   
}

async  function getMyProfile(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }

        const profile = await profileService.getProfileById(req.user.id, req.user.role);  
        res.status(200).json({
            message: "Berhasil menampilkan profile",
            profile});
    } catch (error) {
        next(error);
    }   
}


async function updateDataProfile(req, res, next) {    
    try {
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
     
    const existingProfile = await profileService.getProfileById(req.user.id);
    if (!existingProfile) {
      return res.status(404).json({ error: "Profile tidak ditemukan" });
    }
    let imageUrl = existingProfile.photo; // default: pakai yang lama
    // Jika ada upload file baru
    if (req.file) {
      const newFileName = `${req.user.id}/user-photos/${Date.now()}-${req.file.originalname}`;
      const blob = bucket.file(newFileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
      });

      await new Promise((resolve, reject) => {
    blobStream.on('finish', resolve);
    blobStream.on('error', reject);
    blobStream.end(req.file.buffer);
  });

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;

      // Hapus file lama dari bucket (jika ada)
      if (existingProfile.photo) {
        try {
          const oldFileName = existingProfile.photo.split(`${bucket.name}/`)[1];
          await bucket.file(oldFileName).delete();
          console.log(`File lama dihapus: ${oldFileName}`);
        } catch (err) {
          console.warn("Gagal hapus file lama:", err.message);
        }
      }
    }    


        const updatedProfile = await profileService.updateMyDataProfile(req.user.id, {
            ...req.body,
            photo: imageUrl});
        

        const safeProfile = {
            id: updatedProfile.id,
            full_name: updatedProfile.full_name,
            phone: updatedProfile.phone,
            photo: updatedProfile.photo,
            role: updatedProfile.role,
            ...(updatedProfile.Farmers && { Farmers: updatedProfile.Farmers }),
            ...(updatedProfile.Buyers && { Buyers: updatedProfile.Buyers })
        };

        res.status(200).json({
            message: "Berhasil Memperbarui Profile",
            profile: safeProfile
        });
    } catch (error) {
        next(error);
    }
}

async function updatePasswordProfile(req, res, next) {
    try {
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        const changePassword = await profileService.changeMyPasswordProfile(req.user.id, req.body);
            res.status(200).json({
            message: "Berhasil memperbarui akun"
        });

    } catch (error) {
        next(error);
    }
}


async function deleteProfile(req, res) {
    try {
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        const deletedProfile = await profileService.deleteProfileById(req.user.id);
        res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getOtherProfile,
    getMyProfile,
    updateDataProfile,
    updatePasswordProfile,
    deleteProfile    
};
        