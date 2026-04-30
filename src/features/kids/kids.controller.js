const { z } = require("zod");
const { createKidProfile } = require("./kids.service");
const { parseDdMmYyyyToIsoDate, isoDateToDdMmYyyy } = require("../../utils/date");

const createKidSchema = z.object({
  kidName: z.string().min(1).max(120),
  childType: z.enum(["boy", "girl"]),
  dateOfBirth: z.string()
});

async function createKid(req, res, next) {
  try {
    const parsed = createKidSchema.parse(req.body);
    const isoDob = parseDdMmYyyyToIsoDate(parsed.dateOfBirth);

    if (!isoDob) {
      return res.status(400).json({
        success: false,
        message: "dateOfBirth must be in dd/mm/yyyy format"
      });
    }

    const kid = await createKidProfile({
      parentId: req.user.parentId,
      kidName: parsed.kidName,
      childType: parsed.childType,
      dateOfBirth: isoDob
    });

    return res.status(201).json({
      success: true,
      message: "Kid profile created",
      data: {
        kidId: kid.id,
        kidName: kid.kid_name,
        childType: kid.child_type,
        dateOfBirth: isoDateToDdMmYyyy(kid.date_of_birth),
        parentId: kid.parent_id,
        createdAt: kid.created_at
      }
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join("; ")
      });
    }
    return next(error);
  }
}

module.exports = {
  createKid
};
