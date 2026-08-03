const profileService = require("../service/profileService");
const prisma = require("../config/prisma");
const bucket = require('../config/storage');
const path = require("path");


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

async function getMyProfile(req, res, next) {
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

    const fileName = `${req.user.id}/user-photos/${Date.now()}-${path.basename(req.file.originalname)}`;

    const { error } = await bucket.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
        });

    if (error) {
        throw error;
    }

    const { data } = bucket.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(fileName);

    imageUrl = data.publicUrl;

    // Hapus foto lama
    if (existingProfile.photo) {
        try {

            const oldPath = existingProfile.photo.split(
                `/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/`
            )[1];

            if (oldPath) {
                const { error } = await bucket.storage
                    .from(process.env.SUPABASE_BUCKET)
                    .remove([oldPath]);

                if (error) {
                    console.warn("Gagal menghapus foto lama:", error.message);
                }
            }

        } catch (err) {
            console.warn("Gagal menghapus foto lama:", err.message);
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


async function deleteProfile(req, res, next) {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                error: "User tidak ditemukan atau belum login"
            });
        }

        const existingProfile = await profileService.getProfileById(req.user.id);

        if (existingProfile?.photo) {

            try {

                const oldPath = existingProfile.photo.split(
                    `/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/`
                )[1];

                if (oldPath) {
                    const { error } = await bucket.storage
                        .from(process.env.SUPABASE_BUCKET)
                        .remove([oldPath]);

                    if (error) {
                        console.warn("Gagal menghapus foto:", error.message);
                    }
                }

            } catch (err) {
                console.warn("Gagal menghapus foto:", err.message);
            }

        }

        await profileService.deleteProfileById(req.user.id);

        res.status(200).json({
            message: "Profile deleted successfully"
        });

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
        